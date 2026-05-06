import type { ContentItem } from "../types";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
export const ContentItemCard = ({ item }: { item: ContentItem }) => <Card><div className="font-semibold">{item.title}</div><StatusBadge status={item.status} /></Card>;
