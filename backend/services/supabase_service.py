import os
import uuid
import re
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()

#one time creation
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
    #normalize weird characters
    if not filename:
        return ""
    #replace them with an underscore
    safe = re.sub(r'[^\w\-\.]', '_', filename)
    return safe

def upload_file(filename: str, file_data: bytes, content_type: str = "application/octet-stream") -> str:

    #upload file to storage and return its path

    client = get_supabase_client()
    bucket = get_bucket_name()

    safe_filename = sanitize_filename(filename)
    unique_folder = str(uuid.uuid4())
    storage_path = f"materials/{unique_folder}/{safe_filename}"

    #upload
    response = client.storage.from_(bucket).upload(
        path=storage_path,
        file=file_data,
        file_options={"content-type": content_type}
    )

    return storage_path

def delete_file(storage_path: str):

    #cleanup

    if not storage_path:
        return
    client = get_supabase_client()
    bucket = get_bucket_name()
    try:
        client.storage.from_(bucket).remove([storage_path])
    except Exception as e:
        #log the error
        print(f"Failed to delete storage file {storage_path}: {e}")

def insert_material(material_data: dict) -> dict:

    #insert material record to db

    client = get_supabase_client()
    response = client.table("materials").insert(material_data).execute()
    if response.data:
        return response.data[0]
    raise Exception("Failed to insert material into database")

def get_materials() -> list[dict]:

    #get all materials from db

    client = get_supabase_client()
    response = client.table("materials").select("*").order("created_at", desc=True).execute()
    return response.data

def get_material(material_id: int) -> dict | None:

    #get a material by id

    client = get_supabase_client()
    response = client.table("materials").select("*").eq("id", material_id).execute()
    if response.data:
        return response.data[0]
    return None