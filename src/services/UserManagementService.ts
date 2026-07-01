
import supabase from '@/config/supabaseClient';
import { ApiError } from '@/utils/ApiError';

class UserManagementService {
    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                email:users(email),
                role:roles(name),
                status,
                created_at
            `);

        if (error) {
            throw new ApiError(500, "Failed to fetch users.");
        }
        return data;
    }

    async createUser(userData: any) {
        const { error } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true, // Mark email as confirmed since admin is creating it
            user_metadata: {
                full_name: userData.full_name
            }
        });
        if (error) {
            throw new ApiError(error.status || 500, error.message);
        }
        return { message: "User created successfully" };
    }

    async updateUserRole(userId: string, roleId: string) {
        const { data, error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId).select().single();
        if (error) {
            throw new ApiError(400, 'Failed to update user role.');
        }
        return data;
    }

    async toggleUserStatus(userId: string, status: 'active' | 'inactive') {
        const { data, error } = await supabase.from('profiles').update({ status }).eq('id', userId).select().single();
        if (error) {
            throw new ApiError(400, 'Failed to update user status.');
        }
        return data;
    }

    async deleteUser(userId: string) {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) {
            throw new ApiError(error.status || 500, error.message);
        }
    }

    async resendVerificationEmail(email: string) {
        const { error } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
        });

        if (error) {
            throw new ApiError(error.status || 500, "Failed to generate verification link.");
        }
        // Supabase sends the email automatically
        return { message: 'Verification email sent successfully.' };
    }
}

export const userManagementService = new UserManagementService();
