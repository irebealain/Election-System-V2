import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * Standardized Pie Chart Component following Figma design
 * Ensures consistent styling across all pie/donut charts in the application
 */
export default function PieChartWrapper({
  data = [],
  colors = ['#10B981', '#FFA600'],
  innerRadius = 40,
  outerRadius = 50,
  paddingAngle = 2,
  height = '200px',
  showLegend = true,
  showTooltip = true,
  customTooltip = null,
  dataKey = 'value',
  nameKey = 'name',
  startAngle = 90,
  endAngle = -270,
  className = '',
  isAnimationActive = true,
}) {
  // Default tooltip styling to match Figma design
  const defaultTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = data.percentage !== undefined 
        ? data.percentage 
        : ((payload[0].value / payload[0].payload.total) * 100).toFixed(1);
      
      return (
        <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 p-3 rounded-[20px] shadow-xl border border-gray-100 dark:border-gray-700">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {data[nameKey] || data.name}
          </p>
          <div className="mt-1 space-y-0.5">
            <p className="text-xs font-medium">
              <span className="text-gray-500 dark:text-gray-400">Count: </span>
              <span className="text-gray-900 dark:text-gray-100">{payload[0].value}</span>
            </p>
            <p className="text-xs font-medium">
              <span className="text-gray-500 dark:text-gray-400">Percentage: </span>
              <span className="text-gray-900 dark:text-gray-100">
                {typeof percentage === 'string' ? percentage : percentage.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey={dataKey}
            startAngle={startAngle}
            endAngle={endAngle}
            isAnimationActive={isAnimationActive}
            animationBegin={0}
            animationDuration={1500}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                className="transition-opacity hover:opacity-80 cursor-pointer"
                strokeWidth={0}
              />
            ))}
          </Pie>
          
          {showTooltip && (
            <Tooltip
              content={customTooltip || defaultTooltipContent}
              wrapperStyle={{ outline: 'none' }}
            />
          )}

          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={8}
              iconType="circle"
              formatter={(value, entry) => {
                const percentage = entry.payload.percentage !== undefined
                  ? entry.payload.percentage
                  : ((entry.value / entry.payload.total) * 100).toFixed(1);
                return (
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {value} ({percentage}%)
                  </span>
                );
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
