import os
import uuid
import re
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise ValueError("Supabase credentials not found in environment variables.")
        
        _supabase_client = create_client(url, key)
    return _supabase_client

def get_bucket_name() -> str:
    return os.environ.get("SUPABASE_BUCKET", "study-materials")

def sanitize_filename(filename: str) -> str:
    if not filename:
        return ""
    safe = re.sub(r"[^\w\-\.]", "_", filename)
    return safe

def upload_file(
        filename: str,
        file_data: bytes,
        user_id: str,
        content_type: str = "application/octet-stream",
) -> str:
    
    client = get_supabase_client()
    bucket = get_bucket_name()

    safe_filename = sanitize_filename(filename)
    unique_folder = str(uuid.uuid4())
    storage_path = f"materials/{user_id}/{unique_folder}/{safe_filename}"


    client.storage.from_(bucket).upload(
        path=storage_path,
        file=file_data,
        file_options={"content-type": content_type},
    )

    return storage_path

def download_file(storage_path: str) -> bytes:
    client = get_supabase_client()
    bucket = get_bucket_name()
    response = client.storage.from_(bucket).download(storage_path)
    return response

def delete_file(storage_path: str) -> None:
    if not storage_path:
        return
    client = get_supabase_client()
    bucket = get_bucket_name()
    try:
        client.storage.from_(bucket).remove([storage_path])
    except Exception as e:
        print(f"[supabase_service] Failed to delete storage file {storage_path}: {e}")


def insert_material(material_data: dict, user_id: str) -> dict:
    client = get_supabase_client()
    material_data["user_id"] = user_id
    response = client.table("materials").insert(material_data).execute()
    if response.data:
        return response.data[0]
    raise Exception("Failed to insert material into database")


def get_materials(user_id: str) -> list[dict]:
    client = get_supabase_client()
    response = (
        client.table("materials")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


def get_material(material_id: int, user_id: str) -> dict | None:
    client = get_supabase_client()
    response = (
        client.table("materials")
        .select("*")
        .eq("id", material_id)
        .eq("user_id", user_id)
        .execute()
    )
    if response.data:
        return response.data[0]
    return None

def update_material(material_id: int, updates: dict) -> dict | None:
    client = get_supabase_client()
    response = (
        client.table("materials")
        .update(updates)
        .eq("id", material_id)
        .execute()
    )
    if response.data:
        return response.data[0]
    return None


def set_material_status(material_id: int, status: str) -> None:
    update_material(material_id, {"status": status})


def save_processed_text(
        material_id: int,
        processed_text: str,
        processed_at, str,
) -> None:
    update_material(
        material_id,
        {
            "processed_text": processed_text,
            "processed_at": processed_at,
            "processeing_error": None,
            "status": "Processed",
        },
    )

def save_processing_error(material_id: int, error_message: str) -> None:
    update_material(
        material_id,
        {
            "processing_error": error_message,
            "status": "Failed",
        },
    )



