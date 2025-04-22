export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          contact_number: string
          email: string
          address: string
          created_at: string
          updated_at: string
          contact_person: string
          role: string
          profile_image?: string | null
        }
        Insert: {
          id: string
          name: string
          contact_number: string
          email: string
          address: string
          created_at?: string
          updated_at?: string
          contact_person?: string
          role?: string
          profile_image?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_number?: string
          email?: string
          address?: string
          created_at?: string
          updated_at?: string
          contact_person?: string
          role?: string
          profile_image?: string | null
        }
      }
      donations: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string
          quantity: string
          location: string
          distance: string
          pickup_time: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description: string
          quantity: string
          location: string
          distance: string
          pickup_time: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string
          quantity?: string
          location?: string
          distance?: string
          pickup_time?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}