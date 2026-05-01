import sqlite3
import os

# Remove old database if it exists
if os.path.exists('noteTaking.sqlite'):
    os.remove('noteTaking.sqlite')
    print("Old database removed.")

# Create empty database
db = sqlite3.connect('noteTaking.sqlite')
db.close()

print("Empty database 'noteTaking.sqlite' created successfully!")
print("No tables - completely empty.")