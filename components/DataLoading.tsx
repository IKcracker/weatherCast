import { Skeleton } from '@/components/ui/skeleton';
import { View } from 'react-native';
 
export function SkeletonLoading() {
  return (
    <View className="flex mt-4 flex-row items-center gap-4">
      <Skeleton className="h-[180px] bg-gray-400 w-full" />
      <View className="gap-2">
        <Skeleton className="h-6 w-6 bg-gray-400 rounded-full" />
        <Skeleton className="h-4 bg-gray-400 w-[240px]" />
      </View>
    </View>
  );
}