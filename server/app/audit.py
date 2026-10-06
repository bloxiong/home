from sqlalchemy.orm import Session

from .models import Admin, AuditLog


def record(db: Session, admin: Admin, action: str, *, entity: str = "", entity_id: str | int = "",
           summary: str = "", before=None, after=None) -> None:
    """Every admin change goes through here so all admins can see who did what."""
    db.add(AuditLog(admin_email=admin.email, action=action, entity=entity, entity_id=str(entity_id),
                    summary=summary[:500], before=before, after=after))
