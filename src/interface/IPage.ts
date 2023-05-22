export type IPage = Partial<{
  children: React.ReactNode;
  params: {
    [key in string]: string;
  };
  searchParams: {
    [key in string]: string;
  };
}>;
interface ILayout {
  children: React.ReactNode;
}
