
import supabase from '@/config/supabaseClient';
import { authRepository, UserWithRoleAndPermissions } from '@/repositories/AuthRepository';
import { ApiError } from '@/utils/ApiError';

class AuthService {
  async register({ email, password, full_name }: Record<string, any>) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0],
        },
      },
    });

    if (signUpError) {
      throw new ApiError(signUpError.status || 500, signUpError.message);
    }
    if (!signUpData.user) {
        throw new ApiError(500, 'Registration failed: user data not returned.');
    }

    // The handle_new_user trigger in Supabase will create the profile.
    // We may need to assign a default role. Let's check the DB schema again.
    // The profiles table has a role_id which is nullable, so a user can exist without a role.
    // Let's assign the default 'User' role.

    const { data: roleData, error: roleError } = await supabase.from('roles').select('id').eq('name', 'Viewer').single();
    if (roleError || !roleData) {
        // This is a critical error, maybe the seed didn't run.
        console.error("Default role 'Viewer' not found. Assigning role will be skipped.");
    } else {
        const { error: profileError } = await supabase.from('profiles').update({ role_id: roleData.id, full_name: full_name }).eq('id', signUpData.user.id);
        if(profileError) {
            // Log the error but don't block the registration process
            console.error("Failed to assign default role to user:", profileError.message);
        }
    }


    const user = await authRepository.findUserWithRoleAndPermissions(signUpData.user.id);

    return { user, session: signUpData.session };
  }

  async login({ email, password }: Record<string, any>) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiError(error.status || 401, error.message);
    }
    if (!data.user) {
        throw new ApiError(500, 'Login failed: user data not returned.');
    }

    const user = await authRepository.findUserWithRoleAndPermissions(data.user.id);

    return { user, session: data.session };
  }

  async logout(_token: string) {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      throw new ApiError(error.status || 500, error.message);
    }
  }

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
        // Do not reveal if a user exists or not.
        console.error('Password reset error:', error.message);
    }
    // Always return a success message to prevent user enumeration attacks.
    return;
  }

  async resetPassword(_token: string, newPassword: string) {
    // Supabase client needs to be authenticated to change password
    const { data: { user }, error: userError } = await supabase.auth.getUser(_token);
    if (userError || !user) {
        throw new ApiError(401, 'Invalid or expired token.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new ApiError(error.status || 500, error.message);
    }
  }

  async verifyEmail(token: string, email: string) {
    const { data, error } = await supabase.auth.verifyOtp({
        token,
        type: 'signup',
        email,
    });

    if (error) {
        throw new ApiError(error.status || 400, error.message);
    }
    return data;
  }

  async getSession(user: UserWithRoleAndPermissions): Promise<UserWithRoleAndPermissions> {
    // The user object is already enriched by the authMiddleware
    return user;
  }
}

export const authService = new AuthService();
