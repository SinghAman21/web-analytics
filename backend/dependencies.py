from core.database import get_db
from fastapi import Depends, HTTPException

def get_current_site(site_hex: str, db: Session = Depends(get_db)):
    # Example: validate site by hex_key
    site = db.query(Site).filter(Site.hex_key == site_hex).first()
    if not site:
        raise HTTPException(404, "Site not found")
    return site
