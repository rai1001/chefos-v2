-- Sprint 04: Purchasing relationships for Supabase joins

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'purchase_orders_supplier_id_fkey'
  ) then
    alter table purchase_orders
      add constraint purchase_orders_supplier_id_fkey
      foreign key (supplier_id)
      references suppliers(id);
  end if;
end $$;
