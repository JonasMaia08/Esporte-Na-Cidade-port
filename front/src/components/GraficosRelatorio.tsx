import React, { useEffect, useRef, useState } from "react";

import "react-toastify/dist/ReactToastify.css";

import { graphData } from "../services/managerService";

import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";


type MonthlyData = {
    month: string;
    total: number;
}[];

type ModalityData = {
    modality: string;
    total: number;
}[];

type AttendanceData = {
    presencas: number;
    faltas: number;
    taxa_presenca: string;
};

type GraphData = {
    atendimentosPorMes: MonthlyData;
    atendimentosPorModalidade: ModalityData;
    presencasFaltas: AttendanceData;
};

export function GraficosRelatorio() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const result = await graphData();
                setData(result as GraphData);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);
    console.log("data dos grafidco",data)

    if (loading) return <div className="text-center py-10">Carregando dados...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Erro: {error}</div>;
    if (!data) return <div className="text-center py-10">Nenhum dado disponível</div>;

    const COLORS = ["#4CAF50", "#F44336"]; // verde e vermelho para presenças/faltas

    return (
        <div className="xl:px-3 md:px-11 px-5 mt-10">
            <div className="flex md:flex-row flex-col bg-[#d9d9d9] border border-black p-6 gap-6">

                {/* Coluna da esquerda */}
                <div className="flex flex-col gap-4 flex-1 min-w-0">
                    {/* Gráfico de Atendimentos por Mês */}
                    <div className="bg-white p-6 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black w-full">
                        <h3 className="font-bold text-lg mb-4">Comparação Mensal</h3>
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.atendimentosPorMes} barCategoryGap={24}>
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: "#334155", fontSize: 12 }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#334155", fontSize: 12 }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            fontSize: "14px",
                                            color: "#1e293b",
                                        }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="#1e3a8a"
                                        radius={[4, 4, 0, 0]}
                                        barSize={120}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de Atendimentos por Modalidade */}
                    <div className="bg-white p-6 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black w-full">
                        <h3 className="font-bold text-lg mb-4">Comparação das Modalidades</h3>
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.atendimentosPorModalidade} barCategoryGap={24}>
                                    <XAxis
                                        dataKey="modality"
                                        tick={{ fill: "#334155", fontSize: 12 }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#334155", fontSize: 12 }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            fontSize: "14px",
                                            color: "#1e293b",
                                        }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="#1e3a8a"
                                        radius={[4, 4, 0, 0]}
                                        barSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Evasão */}
                <div className="bg-white p-6 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black md:w-[320px] flex-shrink-0 flex flex-col w-full">
                    <h3 className="font-bold text-lg mb-4">Evasão</h3>
                    <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Presenças", value: data.presencasFaltas.presencas },
                                        { name: "Faltas", value: data.presencasFaltas.faltas },
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    innerRadius={30}
                                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    <Cell fill="#166534" />
                                    <Cell fill="#b91c1c" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        fontSize: "14px",
                                        color: "#1e293b",
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center mt-auto">
                        Taxa de Presença: {data.presencasFaltas.taxa_presenca}%
                    </p>
                </div>
            </div>
        </div>
    );
}