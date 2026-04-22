'use client'
import { Student, BagrutScores, SchoolGrades } from './types'

export interface StorageAdapter {
  getStudents(): Promise<Student[]>
  getBagrutScores(): Promise<BagrutScores[]>
  getSchoolGrades(): Promise<SchoolGrades[]>
  saveAll(students: Student[], bagrut: BagrutScores[], school: SchoolGrades[]): Promise<void>
  updateStudent(id: string, data: Partial<Student>): Promise<void>
  updateBagrutScores(id: string, data: Partial<BagrutScores>): Promise<void>
  clear(): Promise<void>
}

const KEYS = {
  students: 'bagrut_students',
  bagrut: 'bagrut_scores',
  school: 'bagrut_school',
}

export const localStorageAdapter: StorageAdapter = {
  async getStudents() {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(KEYS.students)
    return raw ? JSON.parse(raw) : []
  },
  async getBagrutScores() {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(KEYS.bagrut)
    return raw ? JSON.parse(raw) : []
  },
  async getSchoolGrades() {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(KEYS.school)
    return raw ? JSON.parse(raw) : []
  },
  async saveAll(students, bagrut, school) {
    localStorage.setItem(KEYS.students, JSON.stringify(students))
    localStorage.setItem(KEYS.bagrut, JSON.stringify(bagrut))
    localStorage.setItem(KEYS.school, JSON.stringify(school))
  },
  async updateStudent(id, data) {
    const all = await this.getStudents()
    const idx = all.findIndex((s: Student) => s.id === id)
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data }
      localStorage.setItem(KEYS.students, JSON.stringify(all))
    }
  },
  async updateBagrutScores(id, data) {
    const all = await this.getBagrutScores()
    const idx = all.findIndex((s: BagrutScores) => s.studentId === id)
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data }
      localStorage.setItem(KEYS.bagrut, JSON.stringify(all))
    }
  },
  async clear() {
    localStorage.removeItem(KEYS.students)
    localStorage.removeItem(KEYS.bagrut)
    localStorage.removeItem(KEYS.school)
  },
}
