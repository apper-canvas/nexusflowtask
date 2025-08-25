import categoryData from "@/services/mockData/categories.json"

// Create a copy to avoid mutating the original
let categories = [...categoryData]

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAll = async () => {
  await delay(300)
  return [...categories]
}

export const getById = async (id) => {
  await delay(200)
  const category = categories.find(cat => cat.Id === parseInt(id))
  if (!category) {
    throw new Error("Category not found")
  }
  return { ...category }
}

export const create = async (categoryData) => {
  await delay(400)
  
  // Find the highest existing Id and add 1
  const maxId = categories.reduce((max, cat) => Math.max(max, cat.Id), 0)
  
  const newCategory = {
    Id: maxId + 1,
    name: categoryData.name,
    color: categoryData.color,
    createdAt: new Date().toISOString()
  }
  
  categories.unshift(newCategory)
  return { ...newCategory }
}

export const update = async (id, updates) => {
  await delay(300)
  
  const index = categories.findIndex(cat => cat.Id === parseInt(id))
  if (index === -1) {
    throw new Error("Category not found")
  }
  
  categories[index] = { ...categories[index], ...updates }
  return { ...categories[index] }
}

export const remove = async (id) => {
  await delay(250)
  
  const index = categories.findIndex(cat => cat.Id === parseInt(id))
  if (index === -1) {
    throw new Error("Category not found")
  }
  
  const deletedCategory = categories.splice(index, 1)[0]
  return { ...deletedCategory }
}

// Get task count for a category (this would typically come from task service)
export const getTaskCount = async (categoryId, tasks = []) => {
  await delay(100)
  return tasks.filter(task => task.categoryId === parseInt(categoryId)).length
}