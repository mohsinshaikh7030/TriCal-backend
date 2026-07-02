import supabase from '../config/supabaseClient'

export class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
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

  async findAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    if (error) throw error;
    return data as T[];
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates as any)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw error;
  }

  async softDelete(id: string, userId?: string): Promise<T | null> {
    const updates = {
      deleted_at: new Date().toISOString(),
      updated_by: userId,
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error soft-deleting from ${this.tableName}:`, error);
      return null;
    }
    return data as T;
  }
}

