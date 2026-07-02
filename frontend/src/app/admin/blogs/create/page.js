import MultiBlogBuilder from '@/components/admin/MultiBlogBuilder';

export const metadata = {
  title: 'Multi-Blog Builder - Enterprise CMS',
};

export default function CreateMultiBlogPage() {
  return (
    <div className="min-h-screen bg-slate-100/50">
      <MultiBlogBuilder />
    </div>
  );
}
