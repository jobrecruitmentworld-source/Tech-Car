import os
import sys

# Setup Python path so we can import from app
sys.path.append(os.path.dirname(__file__))

from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def create_superuser():
    db = SessionLocal()
    try:
        # Check if user already exists
        email = "admin@example.com"
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Superuser {email} already exists.")
            return

        # Create new superuser
        admin_user = User(
            name="Super Admin",
            email=email,
            password=get_password_hash("admin123"),
            role=UserRole.Admin,
            status=True,
            mobile="1234567890"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Superuser created successfully!")
        print(f"Email: {email}")
        print(f"Password: admin123")
    except Exception as e:
        print(f"Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superuser()
