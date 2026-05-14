import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = ["Монеты", "Самоцветы", "Сенсеи", "Скины доски", "Наборы"];

export function ShopTabs() {
  return (
    <Tabs defaultValue="Монеты">
      <TabsList className="flex h-auto flex-wrap justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
