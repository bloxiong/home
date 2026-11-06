"""Who can read which mailbox in the portal inbox."""
from sqlalchemy.orm import Session

from .config import settings
from .models import Admin


def tracked_mailboxes() -> list[str]:
    return [a.strip().lower() for a in settings().inbox_addresses.split(",") if a.strip()]


def is_shared(mailbox: str) -> bool:
    return mailbox == settings().inbox_address.lower()


def visible_mailboxes(db: Session, me: Admin) -> list[str]:
    """Everyone sees their own address. A super admin also sees every other
    mailbox, except the address of another super admin."""
    own = me.email.lower()
    if not me.is_super:
        return [m for m in tracked_mailboxes() if m == own]
    other_supers = {e.lower() for (e,) in db.query(Admin.email).filter(Admin.is_super.is_(True), Admin.id != me.id)}
    return [m for m in tracked_mailboxes() if m not in other_supers]
