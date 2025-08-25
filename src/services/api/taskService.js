import taskData from "@/services/mockData/tasks.json"

// Create a copy to avoid mutating the original
let tasks = [...taskData]

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAll = async () => {
  await delay(300)
  return [...tasks]
}

export const getById = async (id) => {
  await delay(200)
  const task = tasks.find(task => task.Id === parseInt(id))
  if (!task) {
    throw new Error("Task not found")
  }
  return { ...task }
}

export const create = async (taskData) => {
  await delay(400)
  
  // Find the highest existing Id and add 1
  const maxId = tasks.reduce((max, task) => Math.max(max, task.Id), 0)
  
  const newTask = {
    Id: maxId + 1,
    title: taskData.title,
    dueDate: taskData.dueDate,
    priority: taskData.priority,
    status: "To Do",
    createdAt: new Date().toISOString()
  }
  
  tasks.unshift(newTask)
  return { ...newTask }
}

export const update = async (id, updates) => {
  await delay(300)
  
  const index = tasks.findIndex(task => task.Id === parseInt(id))
  if (index === -1) {
    throw new Error("Task not found")
  }
  
  tasks[index] = { ...tasks[index], ...updates }
  return { ...tasks[index] }
}

export const remove = async (id) => {
  await delay(250)
  
  const index = tasks.findIndex(task => task.Id === parseInt(id))
  if (index === -1) {
    throw new Error("Task not found")
  }
  
  const deletedTask = tasks.splice(index, 1)[0]
  return { ...deletedTask }
}