from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import Base, Todo
from schemas import TodoCreate, TodoUpdate, TodoOut
from database import SessionLocal, engine

# Create the database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI()

# Some routes
@app.get("/")
def read_root():
    return {"message": "Hello World"}

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "",  # Vite dev server
        "",  # Netlify deployed frontend 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create a new to-do item
@app.post("/todos/", response_model=TodoOut)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(title=todo.title, completed=todo.completed)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

# Get a single to-do item by ID
@app.get("/todos/{todo_id}", response_model=TodoOut)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(Todo).get(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

# Update a to-do item
@app.put("/todos/{todo_id}", response_model=TodoOut)
def update_todo(todo_id: int, updated: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(Todo).get(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.title = updated.title
    todo.completed = updated.completed
    db.commit()
    return todo

# Delete a to-do item
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(Todo).get(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted"}

# Filter to-do items by status
@app.get("/todos/filter/{status}", response_model=list[TodoOut])
def filter_todos(status: str, db: Session = Depends(get_db)):
    if status == "completed":
        return db.query(Todo).filter(Todo.completed == True).all()
    elif status == "pending":
        return db.query(Todo).filter(Todo.completed == False).all()
    return db.query(Todo).all()