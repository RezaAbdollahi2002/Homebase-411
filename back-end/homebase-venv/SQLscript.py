from sqlalchemy import create_engine, text

# Update this with your actual database URL
engine = create_engine("sqlite:///Homebase_DB.db")  # For SQLite

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS chat_users"))
    print("chat_users table dropped.")