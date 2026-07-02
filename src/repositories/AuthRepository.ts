
import supabase from '../config/supabaseClient'
import { BaseRepository } from './BaseRepository';

// Define a more detailed Profile type based on your schema
interface Profile {
    id: string;
    role_id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    // Add other profile fields here
}

// Define a type for the user details we want to fetch
export interface UserWithRoleAndPermissions extends Profile {
    email?: string;
    role: string;
    permissions: string[];
}


class AuthRepository extends BaseRepository<Profile> {
  constructor() {
    super('profiles'); // The base table for user-related data is 'profiles'
  }

  async findUserWithRoleAndPermissions(userId: string): Promise<UserWithRoleAndPermissions | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        role:roles ( name ),
        permissions:roles ( role_permissions ( permissions ( name ) ) )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user with permissions:', error);
      return null;
    }

    if (!data) {
        return null;
    }

    // Process the deeply nested structure from Supabase
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if(userError) {
        console.error('Error fetching user email:', userError);
        // continue without email if it fails
    }

    const permissions = Array.isArray(data.permissions)
        ? data.permissions.flatMap((p: any) => 
            Array.isArray(p?.role_permissions)
                ? p.role_permissions.map((rp: any) => rp?.permissions?.name).filter(Boolean)
                : []
          )
        : [];

    return {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        role: Array.isArray(data.role) ? (data.role[0]?.name || '') : (data.role as any)?.name || '',
        permissions,
        email: user?.user?.email,
    } as UserWithRoleAndPermissions;
  }
}

export const authRepository = new AuthRepository();
