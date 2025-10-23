'use client';

import { useEffect, useState, useRef } from 'react'; // <-- add useRef
import { useAuth } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types'; // <-- supabase se hata ke yeh
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- NEW: local state to control images textarea & file input
  const [imagesText, setImagesText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  // --- when opening form for edit, prefill imagesText
  useEffect(() => {
    if (showForm) {
      setImagesText(editingProduct?.images?.join('\n') || '');
    }
  }, [showForm, editingProduct]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load');
    const data: Product[] = await res.json();
    setProducts(data);
  };

  // --- NEW: upload helper (single file)
  async function uploadOne(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'freakthetix/gym-wear');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url as string; // secure_url
  }

  // --- NEW: upload multiple & append to textarea
  async function handleUploadToCloudinary() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return alert('Select image files first.');
    try {
      const urls = await Promise.all(Array.from(files).map(uploadOne));
      const appended = [imagesText.trim(), ...urls].filter(Boolean).join('\n');
      setImagesText(appended);
      // clear file input selection
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Upload error');
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: String(formData.get('name') || ''),
      slug: String(formData.get('name') || '')
        .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: String(formData.get('description') || ''),
      price: parseFloat(String(formData.get('price') || '0')),
      sizes: String(formData.get('sizes') || '')
        .split(',').map(s => s.trim()).filter(Boolean),
      colors: String(formData.get('colors') || '')
        .split(',').map(c => c.trim()).filter(Boolean),
      fabric: String(formData.get('fabric') || ''),
      quantity: parseInt(String(formData.get('quantity') || '0')),
      product_details: String(formData.get('product_details') || ''),
      // --- use controlled imagesText instead of formData.get('images')
      images: imagesText.split('\n').map(i => i.trim()).filter(Boolean).slice(0, 10),
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      setImagesText(''); // clear
      (e.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <Button
            onClick={() => { setShowForm(!showForm); setEditingProduct(null); }}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            {/* --- PRODUCT FORM (all schema fields) --- */}
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="name">Name *</Label>
      <Input id="name" name="name" required defaultValue={editingProduct?.name ?? ''}/>
    </div>

    <div className="space-y-2">
      <Label htmlFor="price">Price *</Label>
      <Input id="price" name="price" type="number" step="0.01" min="0" required
             defaultValue={editingProduct?.price ?? ''}/>
    </div>

    <div className="space-y-2">
      <Label htmlFor="quantity">Quantity *</Label>
      <Input id="quantity" name="quantity" type="number" min="0" required
             defaultValue={editingProduct?.quantity ?? 0}/>
    </div>

    <div className="space-y-2">
      <Label htmlFor="fabric">Fabric</Label>
      <Input id="fabric" name="fabric" defaultValue={editingProduct?.fabric ?? ''}/>
    </div>
  </div>

  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea id="description" name="description" rows={3}
              defaultValue={editingProduct?.description ?? ''}/>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="sizes">Sizes (comma separated)</Label>
      <Input id="sizes" name="sizes"
             placeholder="S, M, L, XL"
             defaultValue={editingProduct?.sizes?.join(', ') ?? ''}/>
    </div>

    <div className="space-y-2">
      <Label htmlFor="colors">Colors (comma separated)</Label>
      <Input id="colors" name="colors"
             placeholder="black, white"
             defaultValue={editingProduct?.colors?.join(', ') ?? ''}/>
    </div>
  </div>

  <div className="space-y-2">
    <Label htmlFor="product_details">Product Details</Label>
    <Textarea id="product_details" name="product_details" rows={4}
              defaultValue={editingProduct?.product_details ?? ''}/>
  </div>

  {/* --- Upload to Cloudinary controls (your existing ones) --- */}
  <div className="space-y-2">
    <Label>Upload Images</Label>
    <div className="flex gap-3 items-center">
      <Input type="file" multiple accept="image/*" ref={fileInputRef}/>
      <Button type="button" onClick={handleUploadToCloudinary}
              className="bg-white text-black hover:bg-gray-200">
        Upload to Cloudinary
      </Button>
    </div>
    <p className="text-xs text-gray-400">
      Select 1–10 images and click Upload. URLs will be added below.
    </p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="images">Image URLs (one per line, max 10)</Label>
    <Textarea id="images" name="images" rows={5}
              placeholder={`https://res.cloudinary.com/.../image1.jpg\nhttps://res.cloudinary.com/.../image2.jpg`}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
    />
  </div>

  <Button type="submit" disabled={submitting}
          className="w-full bg-white text-black hover:bg-gray-200">
    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
  </Button>
</form>

          </div>
        )}

        {/* products list ... unchanged except _id usage */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-400">No products yet. Add your first product!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-400">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Stock: {product.quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(product)} variant="outline" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(product._id)} variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
