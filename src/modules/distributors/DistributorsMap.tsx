import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { Distributor } from './types';

import colombiaGeo from './colombia.geo.json';

type DeptProperties = Record<string, unknown>;
type DeptFeature = Feature<Geometry, DeptProperties>;

function getDeptName(f: DeptFeature): string {
  const p = f.properties || {};
  const name = p.NOMBRE_DPT || p.NOMBRE || p.name || p.NAME_1 || p.DEPARTAMEN;
  return typeof name === 'string' ? name : 'Departamento';
}

interface Props {
  distributors: Distributor[];
  onSelect: (d: Distributor) => void;
  selectedId?: string | number | null;
  onDepartmentFocus?: (name: string | null) => void;
}

export default function DistributorsMap({
  distributors,
  onSelect,
  selectedId,
  onDepartmentFocus,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const width = 1200;
  const height = 720;

  const projection = useMemo(() => {
    return geoMercator()
      .center([-74, 4.5]) // Ajustado un pelo al centro real
      .scale(3500) // Un poquito más de zoom inicial
      .translate([width / 2, height / 2]);
  }, []);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const features = useMemo(() => {
    const fc = colombiaGeo as FeatureCollection;
    return (fc.features || []) as DeptFeature[];
  }, []);

  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);

    const zb = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    zoomRef.current = zb;
    svg.call(zb);
    svg.call(zb.transform, zoomIdentity);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const zoomToFeature = (f: DeptFeature) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = select(svgRef.current);
    const zb = zoomRef.current;
    const b = pathGenerator.bounds(f);
    const [[x0, y0], [x1, y1]] = b;
    const dx = x1 - x0,
      dy = y1 - y0;
    if (!isFinite(dx) || !isFinite(dy) || dx <= 0 || dy <= 0) return;
    const scale = Math.max(1, Math.min(10, 0.85 / Math.max(dx / width, dy / height)));
    const t = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    svg
      .transition()
      .duration(750)
      .call(zb.transform, t);
  };

  useEffect(() => {
    if (!selectedId) return;
    const d = distributors.find(
      (x) => x.id === selectedId || x.id.toString() === selectedId.toString()
    );
    if (!d) return;

    if (!svgRef.current || !zoomRef.current) return;
    const svg = select(svgRef.current);
    const zb = zoomRef.current;

    // Si d.lat/lng no existen, intentamos con d.coordinates
    const lat = d.lat || d.coordinates?.[0];
    const lng = d.lng || d.coordinates?.[1];
    if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const pt = projection([lng, lat]);
    if (!pt) return;
    const t = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(4)
      .translate(-pt[0], -pt[1]);
    svg
      .transition()
      .duration(750)
      .call(zb.transform, t);
  }, [selectedId, distributors, projection]);

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(600)
      .call(zoomRef.current.transform, zoomIdentity);
    onDepartmentFocus?.(null);
  };

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-[60vh] w-full cursor-grab select-none rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,#020817_0%,#081225_100%)] shadow-[0_28px_80px_rgba(2,8,23,0.34)] md:h-[80vh]"
        onDoubleClick={resetZoom}
      >
        <defs>
          <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g ref={gRef}>
          {features.map((feature, i) => {
            const name = getDeptName(feature);
            const isHover = hoveredDept === name;
            return (
              <path
                key={`dept-${i}`}
                d={pathGenerator(feature) || ''}
                fill={isHover ? '#16326b' : '#0b1730'}
                stroke={isHover ? '#fb923c' : '#334155'}
                strokeWidth={isHover ? 2 : 0.5}
                className="transition-colors duration-200"
                onMouseEnter={(e) => {
                  setHoveredDept(name);
                  onDepartmentFocus?.(name);
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (rect)
                    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: name });
                }}
                onMouseLeave={() => {
                  setHoveredDept(null);
                  setTooltip(null);
                }}
                onClick={() => zoomToFeature(feature)}
              />
            );
          })}

          {distributors.map((d) => {
            // Lógica robusta para detectar coordenadas
            const lat = Number(d.lat || d.coordinates?.[0]);
            const lng = Number(d.lng || d.coordinates?.[1]);

            // Jitter para que no se solapen (usamos el ID como semilla)
            const seed = Number(d.id) || 0;
            const jitterLat = Math.sin(seed) * 0.012;
            const jitterLng = Math.cos(seed) * 0.012;

            const pt = projection([lng + jitterLng, lat + jitterLat]);
            if (!pt) return null;

            const active = selectedId?.toString() === d.id.toString();

            return (
              <g
                key={`pin-${d.id}`}
                transform={`translate(${pt[0]}, ${pt[1]})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(d);
                }}
              >
                {active && <circle r="15" fill="#f97316" className="animate-ping" opacity="0.3" />}
                <circle
                  r={active ? 8 : 4.5}
                  fill={active ? '#fb923c' : '#ff7d00'}
                  stroke="#ffffff"
                  strokeWidth={active ? 2 : 1}
                  filter="url(#pinGlow)"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-xl border border-white/10 bg-slate-950/92 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-xl backdrop-blur"
          style={{ left: tooltip.x + 15, top: tooltip.y - 15 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
