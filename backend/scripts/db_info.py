import os
from dotenv import load_dotenv
from pathlib import Path
import psycopg2

load_dotenv(Path(__file__).resolve().parent / '.env')
user = os.getenv('DB_USER')
pw = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST', 'localhost')
port = os.getenv('DB_PORT', '5432')
dbname = os.getenv('DB_NAME', 'babyjoy')

print('Connecting to', host, port, 'as', user, '-> database', dbname)
try:
    conn = psycopg2.connect(dbname=dbname, user=user, password=pw, host=host, port=port)
    cur = conn.cursor()
    cur.execute("SELECT datname, pg_get_userbyid(datdba) as owner, pg_database_size(datname) as size FROM pg_database WHERE datname=%s;", (dbname,))
    row = cur.fetchone()
    if row:
        name, owner, size = row
        print(f"Database: {name}\nOwner: {owner}\nSize (bytes): {size}")
    else:
        print('Database not found in pg_database')
    cur.execute("SHOW data_directory;")
    data_dir = cur.fetchone()[0]
    print('Postgres data_directory:', data_dir)
    cur.close()
    conn.close()
except Exception as e:
    print('ERROR:', e)
