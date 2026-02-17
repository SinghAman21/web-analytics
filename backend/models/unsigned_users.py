"""
Supabase Schema Definitions

These are NOT SQLAlchemy models but represent the Supabase tables:

Table: sites
  - id (UUID, primary key)
  - name (text)
  - hex_key (text, unique)
  - created_at (timestamp with timezone)

Table: pageviews
  - id (bigint, primary key, auto-incrementing)
  - hex_key (text, foreign key -> sites.hex_key) [CHANGED: Using hex_key as FK]
  - path (text)
  - session_id (text)
  - is_bounce (boolean)
  - created_at (timestamp with timezone)
  - ip_hash (text)
  - ua_hash (text)
"""

from typing import Optional, List
from pydantic import BaseModel
import uuid
from datetime import datetime

# Pydantic models for API validation

class SiteCreate(BaseModel):
    name: str
    hex_key: str

class SiteResponse(BaseModel):
    id: str
    name: str
    hex_key: str
    created_at: datetime

class PageviewCreate(BaseModel):
    hex_key: str  # FK to sites.hex_key
    path: str
    session_id: str
    is_bounce: bool = False
    ip_hash: str
    ua_hash: str

class PageviewResponse(BaseModel):
    id: int
    hex_key: str  # FK to sites.hex_key
    path: str
    session_id: str
    is_bounce: bool
    created_at: datetime
    ip_hash: str
    ua_hash: str
