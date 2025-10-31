import BannerAddForm from "@/components/admin/BannerAddForm";





export default async function BannerPage(){
   
  return (
    <div>
      <h1 className="text-xl font-bold mb-1 text-gray-600">Manage Banner</h1>
      <p className="mb-6 text-sm text-gray-400">
        Upload images to create a new banner.
      </p>
      <div className=" bg-base-100 mb-4">
        <BannerAddForm />
      </div>
    </div>
  );
}
