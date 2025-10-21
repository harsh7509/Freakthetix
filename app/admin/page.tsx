'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Product, supabase } from '@/lib/supabase';
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

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()).filter(Boolean),
      colors: (formData.get('colors') as string).split(',').map(c => c.trim()).filter(Boolean),
      fabric: formData.get('fabric') as string,
      quantity: parseInt(formData.get('quantity') as string),
      product_details: formData.get('product_details') as string,
      images: (formData.get('images') as string).split('\n').map(i => i.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert([productData]);
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await supabase.from('products').delete().eq('id', id);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
            }}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editingProduct?.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.price}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    defaultValue={editingProduct?.quantity}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fabric">Fabric</Label>
                  <Input
                    id="fabric"
                    name="fabric"
                    defaultValue={editingProduct?.fabric}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    name="sizes"
                    placeholder="S, M, L, XL"
                    defaultValue={editingProduct?.sizes.join(', ')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colors">Colors (comma-separated)</Label>
                  <Input
                    id="colors"
                    name="colors"
                    placeholder="Black, White, Gray"
                    defaultValue={editingProduct?.colors.join(', ')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  defaultValue={editingProduct?.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_details">Product Details</Label>
                <Textarea
                  id="product_details"
                  name="product_details"
                  defaultValue={editingProduct?.product_details}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Image URLs (one per line, max 10)</Label>
                <Textarea
                  id="images"
                  name="images"
                  rows={5}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  defaultValue={editingProduct?.images.join('\n')}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-400">No products yet. Add your first product!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/5 border border-white/10 p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-400">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Stock: {product.quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(product)}
                      variant="outline"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="outline"
                      size="sm"
                    >
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
