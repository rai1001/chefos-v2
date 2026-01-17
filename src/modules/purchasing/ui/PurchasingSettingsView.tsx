'use client'

import { useState } from 'react'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { useActiveOrg } from '@/modules/orgs/hooks/useActiveOrg'
import { createSupplier, createSupplierItem } from '../data/purchasingApi'
import { useSuppliers, useSupplierItems } from '../hooks/usePurchasing'

export function PurchasingSettingsView() {
  const { orgId } = useActiveOrg()
  const { data: suppliers, isLoading, error } = useSuppliers()
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemUnit, setItemUnit] = useState('kg')
  const [itemPack, setItemPack] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const { data: items } = useSupplierItems(selectedSupplierId)

  const handleCreateSupplier = async () => {
    if (!orgId || !supplierName.trim()) {
      setActionError('Ingresa el nombre del proveedor.')
      return
    }
    setActionError(null)
    try {
      await createSupplier({ orgId, name: supplierName })
      setSupplierName('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo crear el proveedor')
    }
  }

  const handleCreateItem = async () => {
    if (!orgId || !selectedSupplierId || !itemName.trim()) {
      setActionError('Selecciona proveedor y completa el item.')
      return
    }
    setActionError(null)
    try {
      await createSupplierItem({
        orgId,
        supplierId: selectedSupplierId,
        name: itemName,
        purchaseUnit: itemUnit,
        packSize: itemPack ? Number(itemPack) : null,
        unitPrice: itemPrice ? Number(itemPrice) : null
      })
      setItemName('')
      setItemPack('')
      setItemPrice('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo crear el item')
    }
  }

  return (
    <AppShell title="Settings" description="Catalogo de proveedores">
      <PageHeader title="Proveedores" description="Alta rapida de proveedores e items" />

      {actionError && (
        <div className="mb-6">
          <Banner message={actionError} type="error" />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Banner message={error.message} type="error" />
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
            <h3 className="text-base font-semibold text-white">Lista de proveedores</h3>
            <div className="mt-4 space-y-2">
              {suppliers?.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                    supplier.id === selectedSupplierId
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-100'
                      : 'border-slate-800/70 text-slate-200'
                  }`}
                  onClick={() => setSelectedSupplierId(supplier.id)}
                >
                  {supplier.name}
                </button>
              ))}
              {!suppliers?.length && <p className="text-sm text-slate-400">Sin proveedores aun.</p>}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-[2fr,1fr]">
              <input
                className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                placeholder="Nuevo proveedor"
                value={supplierName}
                onChange={(event) => setSupplierName(event.target.value)}
              />
              <button
                type="button"
                onClick={handleCreateSupplier}
                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
              >
                Crear
              </button>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
            <h3 className="text-base font-semibold text-white">Items del proveedor</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {items?.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800/70 px-4 py-3">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {item.purchaseUnit} · pack {item.packSize ?? '—'} · €{item.unitPrice ?? '—'}
                  </p>
                </div>
              ))}
              {!items?.length && <p className="text-sm text-slate-400">Selecciona un proveedor.</p>}
            </div>
            <div className="mt-6 grid gap-3">
              <input
                className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                placeholder="Nuevo item"
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                  placeholder="Unidad"
                  value={itemUnit}
                  onChange={(event) => setItemUnit(event.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                  placeholder="Pack"
                  value={itemPack}
                  onChange={(event) => setItemPack(event.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                  placeholder="Precio"
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateItem}
                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
              >
                Añadir item
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  )
}
