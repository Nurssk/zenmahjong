import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const filters = ["Мир", "Казахстан", "Павлодар", "Алматы", "Друзья"];

export function LeaderboardTabs() {
  return (
    <Tabs defaultValue="Мир">
      <TabsList className="flex h-auto flex-wrap justify-start">
        {filters.map((filter) => (
          <TabsTrigger key={filter} value={filter}>
            {filter}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
