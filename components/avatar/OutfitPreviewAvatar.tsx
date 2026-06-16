/**
 * OutfitPreviewAvatar - عرض قطع الملابس على الهيئة
 * Layers clothing items visually on the SVG body avatar
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  G,
  Defs,
  ClipPath,
  Image as SvgImage,
} from 'react-native-svg';
import { Colors, FontSize, Spacing } from '../../constants/Colors';
import BodyModel from './BodyModel';
import type { BodyProfile } from '../../models/BodyProfile';
import type { ClothingItem } from '../../models/ClothingItem';

interface LayerItem {
  item: ClothingItem;
  zIndex: number; // lower = drawn first (behind)
}

interface Props {
  profile: BodyProfile;
  items: ClothingItem[];
  height?: number;
  width?: number;
}

/**
 * OutfitPreviewAvatar - Renders the body avatar with
 * clothing layers drawn on top (SVG overlays).
 *
 * Items are positioned based on their category:
 * - top: shirts, jackets, sweaters → upper body
 * - bottom: pants, shorts, skirts → lower body
 * - full: dresses, overalls → full body
 * - footwear: shoes → feet area
 * - accessories: watch, necklace, etc → wrists/neck
 */
export default function OutfitPreviewAvatar({
  profile,
  items,
  height = 400,
  width = 200,
}: Props) {
  const scale = height / 600;
  const shapeFactor =
    profile.shape === 'slim'
      ? 0.82
      : profile.shape === 'athletic'
        ? 1.08
        : profile.shape === 'curvy'
          ? 1.15
          : profile.shape === 'plus'
            ? 1.28
            : 1.0;

  const heightFactor = profile.measurements.height / 170;

  // Sort items by z-order for proper layering
  const layers: LayerItem[] = items
    .map((item) => ({
      item,
      zIndex: getZIndex(item.category),
    }))
    .sort((a, b) => a.zIndex - b.zIndex);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <BodyModel profile={profile} height={height} width={width} />
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>
            اختر قطع الملابس لعرضها على الهيئة
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 200 600">
        <G scale={scale} originX={100} originY={300}>
          {/* Base body (behind clothing) */}
          <G opacity={0.3}>
            {/* Simplified body silhouette */}
            <Ellipse cx={100} cy={50} rx={30 * shapeFactor} ry={35} />
            <Rect
              x={90 - 4 * (1 - shapeFactor)}
              y={85}
              width={20 * shapeFactor}
              height={15}
            />
            <Path
              d={`M${68 * shapeFactor} 100 Q${78 * shapeFactor} 130 ${
                72 * shapeFactor
              } 155 L${128 * shapeFactor} 155 Q${122 * shapeFactor} 130 ${
                132 * shapeFactor
              } 100 Z`}
            />
            <Path
              d={`M${70 * shapeFactor} 105 L${48 * shapeFactor} 180 L${
                52 * shapeFactor
              } 188 L${72 * shapeFactor} 140`}
            />
            <Path
              d={`M${130 * shapeFactor} 105 L${152 * shapeFactor} 180 L${
                148 * shapeFactor
              } 188 L${128 * shapeFactor} 140`}
            />
            <Path
              d={`M${82 * shapeFactor} 155 L${78 * shapeFactor} ${
                270 * heightFactor
              } L${90 * shapeFactor} ${270 * heightFactor} L${
                95 * shapeFactor
              } 155`}
            />
            <Path
              d={`M${118 * shapeFactor} 155 L${122 * shapeFactor} ${
                270 * heightFactor
              } L${110 * shapeFactor} ${270 * heightFactor} L${
                105 * shapeFactor
              } 155`}
            />
            <Ellipse
              cx={84 * shapeFactor}
              cy={275 * heightFactor}
              rx={14 * shapeFactor}
              ry={6}
            />
            <Ellipse
              cx={116 * shapeFactor}
              cy={275 * heightFactor}
              rx={14 * shapeFactor}
              ry={6}
            />
          </G>

          {/* Clothing layers */}
          {layers.map((layer, idx) => (
            <ClothingLayer
              key={layer.item.id + '-' + idx}
              item={layer.item}
              shapeFactor={shapeFactor}
              heightFactor={heightFactor}
            />
          ))}

          {/* Head on top of everything */}
          <Ellipse
            cx={100}
            cy={50}
            rx={30 * shapeFactor}
            ry={35}
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        </G>
      </Svg>
    </View>
  );
}

/** Draw a clothing item as an SVG layer on the body */
function ClothingLayer({
  item,
  shapeFactor,
  heightFactor,
}: {
  item: ClothingItem;
  shapeFactor: number;
  heightFactor: number;
}) {
  const color = item.colorHex || '#888';
  const opacity = 0.85;

  switch (item.category) {
    case 'top':
      return (
        <G opacity={opacity}>
          {/* Torso garment */}
          <Path
            d={`M${68 * shapeFactor} 95 Q${78 * shapeFactor} 120 ${
              72 * shapeFactor
            } 165 L${128 * shapeFactor} 165 Q${122 * shapeFactor} 120 ${
              132 * shapeFactor
            } 95 Z`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          {/* Sleeves */}
          <Path
            d={`M${70 * shapeFactor} 105 L${48 * shapeFactor} 175 L${
              52 * shapeFactor
            } 180 L${72 * shapeFactor} 135`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          <Path
            d={`M${130 * shapeFactor} 105 L${152 * shapeFactor} 175 L${
              148 * shapeFactor
            } 180 L${128 * shapeFactor} 135`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          {/* Collar / neckline */}
          <Path
            d={`M88 95 Q100 105 112 95`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={1.5}
            fill="none"
          />
        </G>
      );

    case 'bottom':
      return (
        <G opacity={opacity}>
          {/* Pants / skirt region */}
          <Path
            d={`M${76 * shapeFactor} 155 L${74 * shapeFactor} ${
              270 * heightFactor
            } L${90 * shapeFactor} ${270 * heightFactor} L${
              98 * shapeFactor
            } 155 L${102 * shapeFactor} 155 L${110 * shapeFactor} ${
              270 * heightFactor
            } L${126 * shapeFactor} ${270 * heightFactor} L${
              124 * shapeFactor
            } 155 Z`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
        </G>
      );

    case 'full':
      return (
        <G opacity={opacity}>
          {/* Dress / full body garment */}
          <Path
            d={`M${70 * shapeFactor} 95 Q${76 * shapeFactor} 140 ${
              72 * shapeFactor
            } 170 L${68 * shapeFactor} ${250 * heightFactor} L${
              132 * shapeFactor
            } ${250 * heightFactor} L${128 * shapeFactor} 170 Q${
              124 * shapeFactor
            } 140 ${130 * shapeFactor} 95 Z`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          {/* Sleeves */}
          <Path
            d={`M${72 * shapeFactor} 105 L${50 * shapeFactor} 160 L${
              54 * shapeFactor
            } 165 L${74 * shapeFactor} 130`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          <Path
            d={`M${128 * shapeFactor} 105 L${150 * shapeFactor} 160 L${
              146 * shapeFactor
            } 165 L${126 * shapeFactor} 130`}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          {/* Neckline */}
          <Path
            d={`M88 95 Q100 108 112 95`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={1.5}
            fill="none"
          />
        </G>
      );

    case 'footwear':
      return (
        <G opacity={opacity}>
          {/* Shoes over feet */}
          <Ellipse
            cx={84 * shapeFactor}
            cy={275 * heightFactor}
            rx={16 * shapeFactor}
            ry={7}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          <Ellipse
            cx={116 * shapeFactor}
            cy={275 * heightFactor}
            rx={16 * shapeFactor}
            ry={7}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
        </G>
      );

    case 'accessories':
      return (
        <G opacity={opacity}>
          {/* Watch on wrist */}
          <Circle
            cx={50 * shapeFactor}
            cy={185}
            r={5}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          <Circle
            cx={150 * shapeFactor}
            cy={185}
            r={5}
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={0.5}
          />
          {/* Necklace */}
          <Path
            d={`M82 90 Q100 100 118 90`}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
        </G>
      );

    default:
      return null;
  }
}

function getZIndex(category: string): number {
  switch (category) {
    case 'footwear':
      return 0; // behind everything
    case 'bottom':
      return 1;
    case 'full':
      return 2;
    case 'top':
      return 3;
    case 'accessories':
      return 4; // on top
    default:
      return 2;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    textAlign: 'center',
    fontFamily: 'Tajawal',
  },
});
