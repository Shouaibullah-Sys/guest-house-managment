"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  CalendarDays, 
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Search,
  Filter,
  Download,
  Activity
} from "lucide-react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: CreditCard,
  },
  {
    title: "Active Bookings",
    value: "356",
    change: "+12.5%",
    trend: "up",
    icon: CalendarDays,
  },
  {
    title: "Available Rooms",
    value: "42",
    change: "-2.4%",
    trend: "down",
    icon: Building2,
  },
  {
    title: "Total Guests",
    value: "1,294",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
];

const recentBookings = [
  {
    id: "BOK-9871",
    guest: "Emma Thompson",
    email: "emma.t@example.com",
    room: "Deluxe Suite - 401",
    status: "Confirmed",
    amount: "$850.00",
    date: "2024-04-15",
  },
  {
    id: "BOK-9872",
    guest: "Michael Chen",
    email: "m.chen@example.com",
    room: "Ocean View - 205",
    status: "Pending",
    amount: "$420.00",
    date: "2024-04-16",
  },
  {
    id: "BOK-9873",
    guest: "Sarah Jenkins",
    email: "sarah.j@example.com",
    room: "Penthouse - 501",
    status: "Checked In",
    amount: "$1,200.00",
    date: "2024-04-13",
  },
  {
    id: "BOK-9874",
    guest: "David Wilson",
    email: "d.wilson@example.com",
    room: "Standard - 108",
    status: "Cancelled",
    amount: "$200.00",
    date: "2024-04-12",
  },
  {
    id: "BOK-9875",
    guest: "Elena Rodriguez",
    email: "elena.r@example.com",
    room: "Premium Suite - 302",
    status: "Confirmed",
    amount: "$680.00",
    date: "2024-04-18",
  },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 space-y-6 pt-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here's what's happening with your property today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-amber-50 gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-900 font-semibold shadow-lg shadow-amber-900/20">
            <CalendarDays className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stat.value}</div>
                  <div className="flex items-center mt-1 text-sm">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground ml-1 text-xs">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        
        {/* Recent Bookings Table */}
        <Card className="col-span-4 bg-slate-900/50 border-white/5 backdrop-blur-xl overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-slate-900/20">
            <div className="space-y-1">
              <CardTitle className="text-xl text-slate-50">Recent Bookings</CardTitle>
              <p className="text-sm text-slate-400">Latest reservations and their status.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-[200px] pl-8 bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-amber-500/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="border-white/10 bg-white/5 hover:bg-white/10 text-amber-50">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <div className="w-full">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-400 bg-slate-900/30 uppercase border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Guest</th>
                    <th className="px-6 py-4 font-medium">Room</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentBookings.map((booking) => (
                    <motion.tr 
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-white/10">
                            <AvatarFallback className="bg-slate-800 text-amber-400">
                              {booking.guest.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-200">{booking.guest}</div>
                            <div className="text-xs text-slate-400">{booking.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{booking.room}</td>
                      <td className="px-6 py-4 text-slate-300">{booking.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          booking.status === 'Confirmed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          booking.status === 'Pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          booking.status === 'Checked In' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-200">
                        {booking.amount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-slate-400">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-slate-900 border-white/10 text-slate-200">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">View details</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">Edit booking</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 cursor-pointer">Cancel booking</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 bg-slate-900/20 text-center">
              <Button variant="link" className="text-amber-400 hover:text-amber-300">
                View all bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="col-span-4 md:col-span-3 space-y-6">
          {/* Revenue Overview Chart placeholder */}
          <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-50 flex items-center justify-between">
                <span>Revenue Overview</span>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full flex items-end gap-2 pb-2 mt-4 relative">
                {/* Mock Chart Bars */}
                <div className="absolute inset-0 border-b border-l border-white/10 left-4 bottom-2" />
                <div className="absolute bottom-2 left-0 text-[10px] text-slate-500 flex flex-col justify-between h-[180px] pb-2">
                  <span>10k</span>
                  <span>5k</span>
                  <span>0</span>
                </div>
                {[40, 70, 45, 90, 65, 85, 120].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center group relative z-10 ml-4">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}px` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full bg-gradient-to-t from-amber-600/50 to-amber-400/80 rounded-t-sm group-hover:from-amber-500/60 group-hover:to-amber-300/90 transition-colors"
                    />
                    <div className="text-[10px] text-slate-500 mt-2">
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-slate-50 flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { text: 'Emma Thompson checked out of Room 401', time: '2 mins ago', type: 'checkout' },
                  { text: 'New booking received for Penthouse', time: '1 hour ago', type: 'booking' },
                  { text: 'Room service ordered for Room 205', time: '3 hours ago', type: 'service' },
                  { text: 'Payment of $850.00 processed', time: '5 hours ago', type: 'payment' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                      activity.type === 'checkout' ? 'bg-slate-400' :
                      activity.type === 'booking' ? 'bg-amber-400' :
                      activity.type === 'service' ? 'bg-blue-400' :
                      'bg-emerald-400'
                    }`} />
                    <div className="space-y-1">
                      <p className="text-sm text-slate-300 leading-none">{activity.text}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
