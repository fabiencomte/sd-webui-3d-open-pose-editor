import logging
import hashlib
import os
import pathlib
import tempfile

import requests

logger = logging.getLogger(__name__)

try:
    root_path = pathlib.Path(__file__).resolve().parent
except NameError:
    import inspect

    root_path = pathlib.Path(inspect.getfile(lambda: None)).resolve().parent

extension_root = root_path.parent if root_path.name == "scripts" else root_path


def file_sha256(path: pathlib.Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def download(url: str, dest: pathlib.Path, expected_sha256: str) -> None:
    dest.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
    temp_path: pathlib.Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            prefix=dest.name + ".",
            suffix=".tmp",
            dir=dest.parent,
            delete=False,
        ) as temp_file:
            temp_path = pathlib.Path(temp_file.name)
            with requests.get(url, stream=True, timeout=(10, 60)) as response:
                response.raise_for_status()
                for chunk in response.iter_content(chunk_size=64 * 1024):
                    if chunk:
                        temp_file.write(chunk)
            temp_file.flush()
            os.fsync(temp_file.fileno())
        actual_sha256 = file_sha256(temp_path)
        if actual_sha256 != expected_sha256:
            raise RuntimeError(
                f"Checksum mismatch for {dest.name}: expected {expected_sha256}, got {actual_sha256}"
            )
        temp_path.replace(dest)
    except requests.exceptions.RequestException as e:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise RuntimeError(f"Unable to download {url}: {e}") from e
    except Exception:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def main():
    MEDIAPIPE_POSE_VERSION = "0.5.1675469404"
    mediapipe_dir = extension_root / "downloads" / "pose" / MEDIAPIPE_POSE_VERSION
    mediapipe_dir.mkdir(mode=0o755, parents=True, exist_ok=True)

    assets = {
        "pose_landmark_full.tflite": "E9A5C5CB17F736FAFD4C2EC1DA3B3D331D6EDBE8A0D32395855AEB2CDFD64B9F",
        "pose_web.binarypb": "DC8EFD1C2D62007B34278467407FDA5F70847F41310E0E39F0F59FC17B1D01F7",
        "pose_solution_packed_assets.data": "A63C614BEF30D35947F13BE361820B1E4E3BEC9CFEEBF4D11216A18373108E85",
        "pose_solution_simd_wasm_bin.wasm": "195A929430E2CE130B3EFB82E64BA27C8E68CB0F6BAD870B715688060EA6F7E2",
        "pose_solution_packed_assets_loader.js": "D7AA29B7D8E11B5C97A58D719E982DD15C2DE72995D95112D60492B854840A36",
        "pose_solution_simd_wasm_bin.js": "3983D1DCA31D945D81ABB70B18DD61F28EF4736E112463D7CFB1CBADEF588127",
    }
    for file_name, expected_sha256 in assets.items():
        file_path = mediapipe_dir / file_name
        if file_path.exists() and file_sha256(file_path) == expected_sha256:
            continue
        url = f"https://cdn.jsdelivr.net/npm/@mediapipe/pose@{MEDIAPIPE_POSE_VERSION}/{file_name}"
        logger.info("Downloading %s...", file_name)
        download(url, file_path, expected_sha256)


if __name__ == "__main__":
    main()
