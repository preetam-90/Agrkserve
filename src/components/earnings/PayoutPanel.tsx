'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowRight, Building2, ShieldCheck, Wallet } from 'lucide-react';

export function PayoutPanel() {
    return (
        <div className="space-y-6 h-full">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-900 border-none shadow-xl shadow-emerald-900/20 text-white relative overflow-hidden">
                {/* Abstract background pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Wallet className="w-32 h-32" />
                </div>

                <CardContent className="p-8">
                    <div className="mb-6">
                        <p className="text-emerald-100 text-sm font-medium mb-1">Available for Payout</p>
                        <h3 className="text-4xl font-bold tracking-tight">₹12,450.00</h3>
                        <p className="text-xs text-emerald-200/80 mt-2 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Next automated payout: Feb 15, 2026
                        </p>
                    </div>

                    <Button className="w-full bg-white text-emerald-800 hover:bg-emerald-50 hover:shadow-lg transition-all font-semibold rounded-lg h-11">
                        Withdraw Funds <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>

            {/* Payment Methods Card */}
            <Card className="bg-[#0c1a13]/50 backdrop-blur-sm border-emerald-500/20">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Payout Method</CardTitle>
                    <CardDescription className="text-gray-400">Manage your bank accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="group relative flex items-center justify-between p-4 border border-emerald-500/20 rounded-xl bg-[#08120d] hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-14 bg-white/5 rounded flex items-center justify-center border border-white/10">
                                <Building2 className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-white text-sm">HDFC Bank</p>
                                <p className="text-xs text-gray-400">**** 4521</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-center font-medium">
                                PRIMARY
                            </span>
                        </div>
                    </div>

                    <div className="group relative flex items-center justify-between p-4 border border-emerald-500/10 rounded-xl bg-[#08120d]/50 hover:bg-[#08120d] hover:border-emerald-500/30 transition-colors opacity-80 hover:opacity-100">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-14 bg-white/5 rounded flex items-center justify-center border border-white/10">
                                <span className="text-blue-400 font-bold text-xs">UPI</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white text-sm">UPI ID</p>
                                <p className="text-xs text-gray-400">rahul@okhdfcbank</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">

                        </Button>
                    </div>

                    <Button variant="outline" className="w-full border-dashed border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/40 bg-transparent mt-2">
                        + Add New Method
                    </Button>
                </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-[#0c1a13]/50 backdrop-blur-sm border-emerald-500/20 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-semibold text-white">Need help?</p>
                        <p className="text-xs text-gray-400">Contact support for payment issues</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white">Help</Button>
                </CardContent>
            </Card>
        </div>
    );
}
