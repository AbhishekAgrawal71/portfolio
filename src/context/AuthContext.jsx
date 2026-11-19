import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const configured = isSupabaseConfigured();

  const verifyAdmin = useCallback(async (currentUser) => {
    if (!currentUser || !supabase) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return false;
    }
    try {
      setCheckingAdmin(true);

      // Primary check: invoke canonical public.is_admin() RPC function.
      // This is a SECURITY DEFINER function that verifies auth.uid() against public.admin_users
      // with table-owner rights, eliminating table grant issues and RLS recursion risks.
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin');

      if (!rpcError && typeof rpcData === 'boolean') {
        setIsAdmin(rpcData);
        return rpcData;
      }

      if (rpcError) {
        console.warn('RPC is_admin verification error, attempting fallback query:', rpcError.message || rpcError);
      }

      // Secondary fallback: direct table query if table-level SELECT grant exists.
      const { data: tableData, error: tableError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (tableError) {
        console.warn('admin_users table query error:', tableError.message || tableError);
      }

      const authorized = !tableError && !!tableData && tableData.user_id === currentUser.id;
      setIsAdmin(authorized);
      return authorized;
    } catch (err) {
      console.warn('Admin authorization verification unexpected error:', err);
      setIsAdmin(false);
      return false;
    } finally {
      setCheckingAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    // Check if URL hash indicates password recovery
    if (window.location.hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }

    // Get current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await verifyAdmin(currentUser);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setIsAdmin(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsPasswordRecovery(false);
      }

      if (currentUser) {
        await verifyAdmin(currentUser);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured, verifyAdmin]);

  const signIn = async ({ email, password }) => {
    if (!configured || !supabase) {
      throw new Error('Supabase is not configured. Please add your credentials to .env file.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data?.user) {
      await verifyAdmin(data.user);
    }
    return data;
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsPasswordRecovery(false);
  };

  const resetPassword = async (email) => {
    if (!configured || !supabase) {
      throw new Error('Supabase is not configured. Please add your credentials to .env file.');
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    if (!configured || !supabase) {
      throw new Error('Supabase is not configured. Please add your credentials to .env file.');
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    setIsPasswordRecovery(false);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        checkingAdmin,
        isPasswordRecovery,
        setIsPasswordRecovery,
        verifyAdmin,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        isConfigured: configured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
