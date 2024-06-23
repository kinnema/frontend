import RegisterModule from "@/lib/features/auth/register";

export default () => {
  return (
    <>
      <h1 className="text-2xl font-semibold">Kayit ol</h1>
      <h6 className="text-xs">
        Favorilerinize ekleyin, son izlediklerinizi takip edin ve daha fazlasi..
      </h6>
      <div className="mt-10">
        <RegisterModule />
      </div>
    </>
  );
};
