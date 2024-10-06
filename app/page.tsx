"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComposedChart, Area, Bar, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Maximize2 , CirclePlus} from 'lucide-react'
const generateDummyData = (days: number) => {
  const data = []
  let price = 60000
  const now = Date.now()
  for (let i = 0; i < days * 24; i++) {
    price = price + Math.random() * 1000 - 500
    data.push({
      time: new Date(now - (days * 24 - i) * 60 * 60 * 1000).toISOString(),
      price: Math.max(0, price),
      volume: Math.floor(Math.random() * 100000)
    })
  }
  return data
}

const timeRanges = [
  { label: '1d', days: 1 },
  { label: '3d', days: 3 },
  { label: '1w', days: 7 },
  { label: '1m', days: 30 },
  { label: '6m', days: 180 },
  { label: '1y', days: 365 },
  { label: 'max', days: 365 * 2 }
]

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      time: string;
      price: number;
      volume: number;
    };
  }>;
  label?: string;
}
export default function Home() {
  const [range, setRange] = useState('1w')
  const [data, setData] = useState<Array<{ time: string; price: number; volume: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000))
        const selectedRange = timeRanges.find(r => r.label === range)
        if (selectedRange) {
          const newData = generateDummyData(selectedRange.days)
          setData(newData)
        }
      } catch  {
        setError('Failed to fetch data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [range])

  const { currentPrice, priceChange } = useMemo(() => {
    if (data.length === 0) {
      return { currentPrice: 0, priceChange: { value: 0, percentage: 0 } }
    }
    const current = data[data.length - 1]?.price ?? 0
    const first = data[0]?.price ?? 0
    const change = current - first
    return {
      currentPrice: current,
      priceChange: {
        value: change,
        percentage: first !== 0 ? (change / first) * 100 : 0
      }
    }
  }, [data])

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md container justify-center">
          <p>{new Date(data.time).toLocaleString()}</p>
          <p>Price: {data.price.toFixed(3)}</p>
          <p>Volume: {data.volume.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='container justify-center flex items-center self-center h-screen'>
      <Card className="w-full max-w-4xl bg-white !border-0">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex self-start">
              <span className="text-6xl text-[#1E293B]">{ currentPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</span>
              <span className="text-2xl ml-2 text-gray-500">USD</span>
            </div>
            <p className={`text-lg ${priceChange.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange.value >= 0 ? '+' : ''}{priceChange.value.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
            </p>
          </div>

          <Tabs defaultValue="chart" className="mb-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex justify-between items-center mb-4 container">
            <div className="flex space-x-2">
              <Button variant="outline" className='flex gap-2' size="sm">
               <Maximize2 size={20}/>
                Fullscreen
              </Button>
              <Button variant="outline" size="sm" className='flex gap-2'>
                <CirclePlus size={20}/>
                Compare
              </Button>
            </div>
            <div className="flex space-x-2">
              {timeRanges.map((r) => (
                <Button
                  key={r.label}
                  variant={range === r.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRange(r.label)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-[300px]"> {/* Reduced height from 400px to 300px */}
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} >
                  <defs>
                    <linearGradient id="colorPrice" >
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} /> {/* Changed color to match image */}
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} /> {/* Changed color to match image */}
                    </linearGradient>
                  </defs>
                 
                  <CartesianGrid strokeDasharray="1 1" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    // stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                    stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}
                    yAxisId="left"
                  />
                  
                  <Bar
                  maxBarSize={10}
                    dataKey="volume"
                    fill="#D3D3D3"
                    yAxisId="right"
                    barSize={2}
                    radius={[3, 3, 0, 0]}
                  />
                  {/* <area shape-rendering="monotone" dataKey="price" stroke="#4F46E5" fillOpacity={1} fill="url(#colorPrice)" /> Added area for gradient effect */}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}