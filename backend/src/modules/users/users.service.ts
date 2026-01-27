import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserDashboardView {
  id: string;
  name: string;
  email: string;
  mobile: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
}

@Injectable()
export class UsersService {
  private supabase: SupabaseClient;    

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase Config Missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findAll(): Promise<UserDashboardView[]> {
    try {
      const { data, error } = await this.supabase
        .from('users') 
        .select('*')
        .order('id', { ascending: false }); 

      if (error) {
        throw new Error(`DB Error: ${error.message}`);
      }

      return (data || []).map((user: any) => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.fullName || user.username || 'N/A',
        email: user.email || 'N/A',
        mobile: user.mobile || user.phoneNumber || 'N/A',
        registrationDate: new Date(
            user.created_at || user.createdAt || user.created_date || Date.now()
        ).toLocaleDateString('en-US', {
             year: 'numeric',
             month: 'short',
             day: 'numeric',
        }),
        status: (user.status as 'Active' | 'Inactive') || 'Active',
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // ================= NEW DELETE FUNCTION =================
  async delete(id: string): Promise<{ message: string }> {
    try {
      // 1. Delete the user from the 'users' table
      const { error, count } = await this.supabase
        .from('users')
        .delete()
        .eq('id', id); // Matches the ID

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      // Optional: Check if a row was actually deleted
      // (Note: Supabase might not return count unless select() is used, but error check is main priority)
      
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
}