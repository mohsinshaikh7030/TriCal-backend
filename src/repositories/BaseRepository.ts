import supabase from '@/config/supabaseClient';
import { PostgrestResponse, PostgrestError } from '@supabase/supabase-js';

export class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .single();
    if (error) throw error;
    return result as T;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  }

  async find(filter: Partial<T>): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .match(filter);
    if (error) throw error;
    return data as T[];
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw error;
  }

  async softDelete(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ deleted_at: new Date() } as any)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  }
}
