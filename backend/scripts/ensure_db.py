import os
import sys
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend folder
load_dotenv(Path(__file__).resolve().parent / '.env')

user = os.getenv('DB_USER')
pw = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST', 'localhost')
port = os.getenv('DB_PORT', '5432')
dbname = os.getenv('DB_NAME', 'babyjoy')

print('Connecting to', host, port, 'as', user)
try:
    conn = psycopg2.connect(dbname='postgres', user=user, password=pw, host=host, port=port)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database;")
    dbs = [r[0] for r in cur.fetchall()]
    print('Databases on server:', dbs)
    if dbname in dbs:
        print('Database exists:', dbname)
    else:
        print('Database not found; creating', dbname)
        cur.execute('CREATE DATABASE "' + dbname + '";')
        print('Created database', dbname)
    cur.close()
    conn.close()
except Exception as e:
    print('ERROR', e)
    sys.exit(1)
