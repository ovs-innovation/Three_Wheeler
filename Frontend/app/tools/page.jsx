'use client';
import React, { useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import vehiclesData from '@/data/vehicles.json';
import { 
  Calculator, DollarSign, Zap, Layers, RefreshCw, 
  TrendingUp, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

export default function ToolsSuitePage() {
  const [activeTool, setActiveTool] = useState('emi'); // 'emi' | 'cost' | 'charging' | 'payload'

  // --- TOOL 1: EMI STATE ---
  const [emiVehiclePrice, setEmiVehiclePrice] = useState(250000);
  const [emiDownPayment, setEmiDownPayment] = useState(50000);
  const [emiRate, setEmiRate] = useState(9.5); // %
  const [emiTenure, setEmiTenure] = useState(36); // months

  // --- TOOL 2: RUNNING COST STATE ---
  const [dailyKm, setDailyKm] = useState(80); // km/day
  const [cngPrice, setCngPrice] = useState(82); // ₹/kg
  const [dieselPrice, setDieselPrice] = useState(90); // ₹/litre
  const [electricityRate, setElectricityRate] = useState(7); // ₹/unit (kWh)

  // --- TOOL 3: EV CHARGING STATE ---
  const [evBatteryKwh, setEvBatteryKwh] = useState(10.5); // kWh battery size
  const [evAvgRange, setEvAvgRange] = useState(110); // km per charge
  const [chargeRate, setChargeRate] = useState(7); // ₹/unit

  // --- TOOL 4: PAYLOAD STATE ---
  const [cargoMaterial, setCargoMaterial] = useState('ecommerce'); // 'ecommerce' | 'vegetables' | 'cement' | 'water'
  const [cargoWeight, setCargoWeight] = useState(600); // kg

  // ================= MATH CALCULATIONS =================

  // 1. EMI Calculations
  const loanAmount = Math.max(0, emiVehiclePrice - emiDownPayment);
  const monthlyRate = (emiRate / 12) / 100;
  const emiNumerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, emiTenure);
  const emiDenominator = Math.pow(1 + monthlyRate, emiTenure) - 1;
  const calculatedEmi = emiDenominator > 0 ? Math.round(emiNumerator / emiDenominator) : 0;
  const totalRepayment = calculatedEmi * emiTenure;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);
  
  // Principal vs Interest percentages for CSS Donut Chart
  const principalPct = totalRepayment > 0 ? Math.round((loanAmount / totalRepayment) * 100) : 0;
  const interestPct = 100 - principalPct;

  // Generate short amortization schedule (first 6 months and summary)
  const amortizationSchedule = [];
  let remainingBalance = loanAmount;
  for (let i = 1; i <= Math.min(12, emiTenure); i++) {
    const interestPayment = Math.round(remainingBalance * monthlyRate);
    const principalPayment = Math.round(calculatedEmi - interestPayment);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    amortizationSchedule.push({
      month: i,
      emi: calculatedEmi,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance
    });
  }

  // 2. Running Cost Calculations (Electric vs CNG vs Diesel)
  // Efficiencies (typical commercial ranges)
  const electricEfficiency = 0.1; // kWh per km (10 km/kWh)
  const cngEfficiency = 35; // km per kg
  const dieselEfficiency = 22; // km per litre

  const costPerKmElectric = (electricityRate * electricEfficiency); // e.g. ₹0.70 / km
  const costPerKmCng = (cngPrice / cngEfficiency); // e.g. ₹2.34 / km
  const costPerKmDiesel = (dieselPrice / dieselEfficiency); // e.g. ₹4.09 / km

  const monthlyRunningElectric = Math.round(costPerKmElectric * dailyKm * 30);
  const monthlyRunningCng = Math.round(costPerKmCng * dailyKm * 30);
  const monthlyRunningDiesel = Math.round(costPerKmDiesel * dailyKm * 30);

  const yearlySavingsElectric = Math.round((monthlyRunningDiesel - monthlyRunningElectric) * 12);
  const yearlySavingsCng = Math.round((monthlyRunningDiesel - monthlyRunningCng) * 12);

  // 3. EV Charging Cost calculations
  const totalChargeCost = Math.round(evBatteryKwh * chargeRate);
  const costPerKmEv = (totalChargeCost / evAvgRange).toFixed(2);

  // 4. Payload suggester suggestion logic
  const getCargoDescription = () => {
    if (cargoMaterial === 'ecommerce') return 'Lightweight but high-volume cargo. Demands enclosed lockable canopy rooms.';
    if (cargoMaterial === 'vegetables') return 'Perishable moist weight. Requires open loader cage panels with mesh.';
    if (cargoMaterial === 'cement') return 'Extremely high weight density. Demands high gradeability and flatbeds.';
    return 'Liquid cargo dynamics. Demands rigid steel suspensions and load balance.';
  };

  const suggestedVehicles = vehiclesData.filter(v => {
    const isCargo = v.category.toLowerCase().includes('cargo') || 
                    v.category.toLowerCase().includes('loader') || 
                    v.category.toLowerCase().includes('pickup');
    if (!isCargo) return false;
    const payloadVal = parseInt(v.payloadCapacity) || 0;
    return payloadVal >= cargoWeight && payloadVal <= cargoWeight + 250;
  }).slice(0, 3);

  return (
    <>
      <Header />
      <main className="bg-brand-bg flex-grow min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* breadcrumb */}
          <div className="text-xs text-gray-400 font-medium mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link> &gt; <span>Tools & Calculators</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-2">Three Wheeler Utilities & Calculators Suite</h1>
          <p className="text-xs text-gray-500 mb-8 max-w-2xl">
            Evaluate your commercial auto rickshaw costs, loan EMIs, EV operation cost savings, and choose the correct fleet size for cargo deliveries.
          </p>

          {/* Calculator Selectors Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { id: 'emi', label: 'EMI Calculator', icon: Calculator, desc: 'Calculate monthly loan repayment' },
              { id: 'cost', label: 'Fuel Savings Cost', icon: DollarSign, desc: 'Electric vs CNG vs Diesel savings' },
              { id: 'charging', label: 'EV Charging Cost', icon: Zap, desc: 'Calculate charge costs & range costs' },
              { id: 'payload', label: 'Payload Suggester', icon: Layers, desc: 'Estimate load sizes for logistics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id)}
                className={`p-4 border rounded-xl text-left transition-all ${
                  activeTool === tab.id 
                    ? 'bg-white border-primary border-2 shadow-md' 
                    : 'bg-white border-brand-border hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-6 h-6 mb-2 ${activeTool === tab.id ? 'text-primary' : 'text-gray-400'}`} />
                <div className="font-extrabold text-xs text-brand-dark">{tab.label}</div>
                <div className="text-[10px] text-gray-400 mt-1 font-medium leading-tight">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* TOOL CONTAINER */}
          <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
            
            {/* ================= 1. EMI CALCULATOR ================= */}
            {activeTool === 'emi' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-lg font-black text-brand-dark flex items-center gap-1.5"><Calculator className="w-5 h-5 text-primary" /> Loan EMI Calculator</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                        <span>Ex-Showroom Price</span>
                        <span className="text-brand-dark font-black">₹{emiVehiclePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="120000"
                        max="500000"
                        step="10000"
                        value={emiVehiclePrice}
                        onChange={(e) => {
                          setEmiVehiclePrice(Number(e.target.value));
                          if (emiDownPayment > Number(e.target.value)) {
                            setEmiDownPayment(Number(e.target.value) - 20000);
                          }
                        }}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                        <span>Down Payment Amount</span>
                        <span className="text-brand-dark font-black">₹{emiDownPayment.toLocaleString('en-IN')} ({Math.round((emiDownPayment / emiVehiclePrice) * 100)}%)</span>
                      </div>
                      <input
                        type="range"
                        min="20000"
                        max={emiVehiclePrice - 20000}
                        step="5000"
                        value={emiDownPayment}
                        onChange={(e) => setEmiDownPayment(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Interest Rate (ROI)</span>
                        <input
                          type="number"
                          min="5"
                          max="20"
                          step="0.1"
                          value={emiRate}
                          onChange={(e) => setEmiRate(Number(e.target.value))}
                          className="w-full border rounded-lg px-3 py-2 text-sm font-semibold bg-gray-50 text-brand-dark"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Tenure (Months)</span>
                        <select
                          value={emiTenure}
                          onChange={(e) => setEmiTenure(Number(e.target.value))}
                          className="w-full border rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 text-brand-dark"
                        >
                          <option value="12">12 Months (1 Yr)</option>
                          <option value="24">24 Months (2 Yrs)</option>
                          <option value="36">36 Months (3 Yrs)</option>
                          <option value="48">48 Months (4 Yrs)</option>
                          <option value="60">60 Months (5 Yrs)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outputs Panel */}
                <div className="lg:col-span-5 space-y-6 bg-gray-50 border border-gray-100 p-6 rounded-xl">
                  <h4 className="text-sm font-extrabold text-brand-dark">Calculated Loan Summary</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-primary-light border border-primary/20 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Calculated Monthly EMI</span>
                      <div className="text-3xl font-black text-primary mt-1">₹{calculatedEmi.toLocaleString('en-IN')}</div>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-gray-500">
                      <div className="flex justify-between"><span>Principal Loan Amount</span><span className="text-brand-dark font-extrabold">₹{loanAmount.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span>Total Interest Charges</span><span className="text-brand-dark font-extrabold">₹{totalInterest.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between border-t pt-2 mt-2 text-sm font-black text-brand-dark"><span>Total Repayment</span><span>₹{totalRepayment.toLocaleString('en-IN')}</span></div>
                    </div>

                    {/* Visual breakdown progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <span>Principal ({principalPct}%)</span>
                        <span>Interest ({interestPct}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
                        <div className="h-full bg-gray-900" style={{ width: `${principalPct}%` }} />
                        <div className="h-full bg-primary" style={{ width: `${interestPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2. FUEL SAVINGS COST COMPARE ================= */}
            {activeTool === 'cost' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-brand-dark flex items-center gap-1.5"><DollarSign className="w-5 h-5 text-primary" /> EV vs CNG vs Diesel Operating Cost Calculator</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Average Daily Running (KM)</label>
                    <input
                      type="number"
                      value={dailyKm}
                      onChange={(e) => setDailyKm(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-bold bg-white text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CNG Price (₹/KG)</label>
                    <input
                      type="number"
                      value={cngPrice}
                      onChange={(e) => setCngPrice(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-bold bg-white text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diesel Price (₹/Litre)</label>
                    <input
                      type="number"
                      value={dieselPrice}
                      onChange={(e) => setDieselPrice(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-bold bg-white text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Electricity (₹/Unit)</label>
                    <input
                      type="number"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-bold bg-white text-brand-dark"
                    />
                  </div>
                </div>

                {/* Operating Savings Matrix Table */}
                <div className="border border-brand-border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left divide-y divide-gray-100">
                    <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Metric</th>
                        <th className="px-6 py-3 text-brand-green bg-green-50/20">Electric Auto</th>
                        <th className="px-6 py-3 text-green-600 bg-green-50/20">CNG Auto</th>
                        <th className="px-6 py-3 text-brand-dark">Diesel Auto (Benchmark)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-gray-500">Cost Per KM</td>
                        <td className="px-6 py-3.5 text-brand-green bg-green-50/20 font-black">₹{costPerKmElectric.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-green-600 bg-green-50/20 font-black">₹{costPerKmCng.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-brand-dark font-extrabold">₹{costPerKmDiesel.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-gray-500">Daily Run Expense</td>
                        <td className="px-6 py-3.5 text-brand-green bg-green-50/20 font-black">₹{Math.round(costPerKmElectric * dailyKm)}</td>
                        <td className="px-6 py-3.5 text-green-600 bg-green-50/20 font-black">₹{Math.round(costPerKmCng * dailyKm)}</td>
                        <td className="px-6 py-3.5 text-brand-dark font-extrabold">₹{Math.round(costPerKmDiesel * dailyKm)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3.5 font-bold text-gray-500">Monthly Run Expense</td>
                        <td className="px-6 py-3.5 text-brand-green bg-green-50/20 font-black">₹{monthlyRunningElectric.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-3.5 text-green-600 bg-green-50/20 font-black">₹{monthlyRunningCng.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-3.5 text-brand-dark font-extrabold">₹{monthlyRunningDiesel.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="bg-brand-bg font-extrabold">
                        <td className="px-6 py-4 text-brand-dark font-black">Annual Savings over Diesel</td>
                        <td className="px-6 py-4 text-brand-green bg-green-50 font-black text-sm">₹{yearlySavingsElectric.toLocaleString('en-IN')} / Yr Saving</td>
                        <td className="px-6 py-4 text-brand-green bg-green-50 font-black text-sm">₹{yearlySavingsCng.toLocaleString('en-IN')} / Yr Saving</td>
                        <td className="px-6 py-4 text-gray-400">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
 
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-xs text-brand-green leading-relaxed font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
                  <span>By switching to an Electric Rickshaw, you will save approximately <strong className="text-brand-dark">₹{yearlySavingsElectric.toLocaleString('en-IN')} per year</strong> in fuel costs alone. Operating savings will pay back your entire vehicle acquisition value in under 2 years!</span>
                </div>
              </div>
            )}

            {/* ================= 3. EV CHARGING COST CALCULATOR ================= */}
            {activeTool === 'charging' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-lg font-black text-brand-dark flex items-center gap-1.5"><Zap className="w-5 h-5 text-primary" /> EV Charging Cost Calculator</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                        <span>Traction Battery Size (kWh)</span>
                        <span className="text-brand-dark font-black">{evBatteryKwh} kWh</span>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="18.0"
                        step="0.5"
                        value={evBatteryKwh}
                        onChange={(e) => setEvBatteryKwh(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                        <span>Average True Range (KM)</span>
                        <span className="text-brand-dark font-black">{evAvgRange} km / charge</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="160"
                        step="5"
                        value={evAvgRange}
                        onChange={(e) => setEvAvgRange(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Electricity Tariff Rate (₹ per Unit / kWh)</span>
                      <input
                        type="number"
                        min="3"
                        max="15"
                        value={chargeRate}
                        onChange={(e) => setChargeRate(Number(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-xs font-bold bg-gray-50 text-brand-dark"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-gray-50 border border-gray-100 p-6 rounded-xl space-y-6">
                  <h4 className="text-sm font-extrabold text-brand-dark">EV Charging Summary</h4>
                  
                  <div className="space-y-4 text-xs font-semibold text-gray-500">
                    <div className="bg-primary-light border border-primary/20 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Full Charge Cost</span>
                      <div className="text-2xl font-black text-primary mt-1">₹{totalChargeCost} Total Cost</div>
                    </div>

                    <div className="flex justify-between"><span>Electricity units consumed</span><span className="text-brand-dark font-extrabold">{evBatteryKwh} Units</span></div>
                    <div className="flex justify-between"><span>Cost per Kilometer (Running)</span><span className="text-brand-green font-black">₹{costPerKmEv} / KM</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. LOGISTICS CARGO PAYLOAD SUGGESTER ================= */}
            {activeTool === 'payload' && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-brand-dark flex items-center gap-1.5"><Layers className="w-5 h-5 text-primary" /> Logistics Payload Volume Suggester</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Select Load Cargo Material</label>
                    <select
                      value={cargoMaterial}
                      onChange={(e) => {
                        setCargoMaterial(e.target.value);
                        if (e.target.value === 'ecommerce') setCargoWeight(450);
                        if (e.target.value === 'vegetables') setCargoWeight(600);
                        if (e.target.value === 'cement') setCargoWeight(850);
                        if (e.target.value === 'water') setCargoWeight(750);
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-xs font-semibold bg-white text-brand-dark outline-none"
                    >
                      <option value="ecommerce">E-commerce Delivery Cartons / Packages</option>
                      <option value="vegetables">Agricultural Produce / Vegetables & Fruits</option>
                      <option value="cement">Construction Cement Bags / Sand Loads</option>
                      <option value="water">Bottled Water Crates / Heavy Beverages</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-1.5">
                      <span>Total weight demand</span>
                      <span className="text-brand-dark font-black">{cargoWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="1000"
                      step="50"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <div className="border border-brand-border rounded-xl p-5 bg-white space-y-4">
                  <h4 className="text-sm font-extrabold text-brand-dark">Cargo Density Analysis</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{getCargoDescription()}</p>
                  
                  <div className="border-t pt-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recommended Vehicles for this Payload</h5>
                    {suggestedVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suggestedVehicles.map(v => (
                          <div key={v.id} className="border border-brand-border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <span className="text-[9px] font-bold text-primary uppercase">{v.brandName}</span>
                            <h6 className="font-extrabold text-sm text-brand-dark mt-0.5 truncate"><Link href={`/vehicles/${v.id}`} className="hover:underline">{v.name}</Link></h6>
                            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase">
                              <span>Payload: {v.payloadCapacity}</span>
                              <span className="text-brand-green">{v.fuelType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic block">No exact recommendations for this load range. Try adjusting load weight slider.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
