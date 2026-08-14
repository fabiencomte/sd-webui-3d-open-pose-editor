import importlib.util
import json
import sys
import types
from pathlib import Path
from unittest.mock import Mock

import pytest
import requests


REPO_ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def backend():
    callbacks = types.SimpleNamespace(
        on_ui_tabs=lambda _callback: None,
        on_ui_settings=lambda _callback: None,
    )
    previous = sys.modules.get("modules")
    sys.modules["modules"] = types.SimpleNamespace(script_callbacks=callbacks)
    try:
        yield load_module("openpose3d_backend_test", REPO_ROOT / "scripts" / "openpose_editor.py")
    finally:
        if previous is None:
            sys.modules.pop("modules", None)
        else:
            sys.modules["modules"] = previous


@pytest.mark.parametrize(
    ("data", "expected"),
    [({"control_net_unit_count": 4}, 4), ({}, 3), ({"control_net_unit_count": "bad"}, 3)],
)
def test_forge_controlnet_unit_count(backend, data, expected):
    assert backend.get_controlnet_unit_count(types.SimpleNamespace(data=data)) == expected


def test_ui_exposes_each_forge_controlnet_unit(backend, monkeypatch):
    shared = types.ModuleType("modules.shared")
    shared.opts = types.SimpleNamespace(
        data={"control_net_unit_count": 4},
        openpose3d_use_online_version=False,
    )
    monkeypatch.setitem(sys.modules, "modules.shared", shared)

    with backend.gr.Blocks() as blocks:
        backend.create_ui()

    config = blocks.get_config_file()
    targets = [
        component["props"]
        for component in config["components"]
        if component["props"].get("label") == "Control Model number"
    ]
    assert len(targets) == 4
    assert all([choice[1] for choice in target["choices"]] == ["-", "0", "1", "2", "3"] for target in targets)


def test_config_points_at_bundled_assets(backend, tmp_path, monkeypatch):
    monkeypatch.setattr(backend, "root_path", REPO_ROOT)
    config_path = backend.write_config_file()
    assets = json.loads(config_path.read_text(encoding="utf-8"))["assets"]
    assert set(assets) >= {
        "models/hand.fbx",
        "models/foot.fbx",
        "src/poses/data.bin",
    }
    assert all(value.startswith("/file=") for value in assets.values())


def test_installer_writes_atomically_to_extension_downloads(tmp_path, monkeypatch):
    installer = load_module("openpose3d_installer_test", REPO_ROOT / "install.py")
    monkeypatch.setattr(installer, "extension_root", tmp_path)
    downloads = []
    monkeypatch.setattr(
        installer,
        "download",
        lambda url, dest, expected_sha256: downloads.append((url, dest, expected_sha256)),
    )
    installer.main()
    assert len(downloads) == 6
    assert all(dest.is_relative_to(tmp_path / "downloads" / "pose") for _, dest, _ in downloads)
    assert all(len(expected_sha256) == 64 for _, _, expected_sha256 in downloads)


def test_failed_download_preserves_existing_file(tmp_path, monkeypatch):
    installer = load_module("openpose3d_installer_failure_test", REPO_ROOT / "install.py")
    destination = tmp_path / "asset.bin"
    destination.write_bytes(b"known-good")
    response = Mock()
    response.__enter__ = Mock(return_value=response)
    response.__exit__ = Mock(return_value=False)
    response.raise_for_status.side_effect = requests.HTTPError("503")
    monkeypatch.setattr(installer.requests, "get", Mock(return_value=response))

    with pytest.raises(RuntimeError, match="Unable to download"):
        installer.download("https://example.invalid/asset.bin", destination, "0" * 64)

    assert destination.read_bytes() == b"known-good"
    assert list(tmp_path.glob("*.tmp")) == []


def test_checksum_mismatch_preserves_existing_file(tmp_path, monkeypatch):
    installer = load_module("openpose3d_installer_checksum_test", REPO_ROOT / "install.py")
    destination = tmp_path / "asset.bin"
    destination.write_bytes(b"known-good")
    response = Mock()
    response.__enter__ = Mock(return_value=response)
    response.__exit__ = Mock(return_value=False)
    response.raise_for_status.return_value = None
    response.iter_content.return_value = [b"unexpected"]
    monkeypatch.setattr(installer.requests, "get", Mock(return_value=response))

    with pytest.raises(RuntimeError, match="Checksum mismatch"):
        installer.download("https://example.invalid/asset.bin", destination, "0" * 64)

    assert destination.read_bytes() == b"known-good"
    assert list(tmp_path.glob("*.tmp")) == []
