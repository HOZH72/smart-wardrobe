/**
 * BodyModel - مكون عرض الجسم البشري (SVG)
 * Renders a stylized 2D body figure using react-native-svg
 * Proportions adapt to measurements, gender, body shape, and age
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Defs,
  ClipPath,
  Image as SvgImage,
  Rect,
} from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import type { BodyProfile, Gender } from '../../models/BodyProfile';
import { calcBMI, getAgeAdjustment } from '../../models/BodyProfile';

interface Props {
  profile: BodyProfile;
  height?: number;
  width?: number;
  showFacePhoto?: boolean;
}

export default function BodyModel({
  profile,
  height = 400,
  width = 200,
  showFacePhoto = true,
}: Props) {
  const { gender, measurements, skinColor, shape, facePhoto, ageRange = '25_34' } = profile;
  const skinHex = skinColor.hex;
  const bmi = calcBMI(measurements);
  const ageAdj = getAgeAdjustment(ageRange);
  const scale = height / 600; // Base height 600

  // Shape factor: how wide/narrow the body is
  const shapeFactor =
    shape === 'slim'
      ? 0.82
      : shape === 'athletic'
        ? 1.08
        : shape === 'curvy'
          ? 1.15
          : shape === 'plus'
            ? 1.28
            : 1.0;

  // Apply age width adjustment on top of shape
  const ageWidthFactor = shapeFactor * ageAdj.widthFactor;

  // Height affects limb length proportionally (age-adjusted)
  const heightFactor = (measurements.height / 170) * ageAdj.heightFactor;

  // Age posture: stoop factor (lower = more stooped)
  // Used to compress the upper body Y coordinates for older ages
  const postureFactor = ageAdj.postureFactor;
  // Y-offset for upper body elements to simulate stoop/hunch
  const stoopY = (1 - postureFactor) * 25;

  // Face photo positioning
  const faceClipId = 'faceClip';

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 200 600">
        <Defs>
          <ClipPath id={faceClipId}>
            <Ellipse cx={100} cy={50 + stoopY} rx={30 * ageWidthFactor} ry={35} />
          </ClipPath>
        </Defs>

        <G scale={scale} originX={100} originY={300}>
          {/* ── HEAD ── */}
          <Ellipse
            cx={100}
            cy={50 + stoopY}
            rx={30 * ageWidthFactor}
            ry={35}
            fill={skinHex}
          />

          {/* Face photo overlay */}
          {showFacePhoto && facePhoto?.uri ? (
            <SvgImage
              href={{ uri: facePhoto.uri }}
              x={100 - 30 * ageWidthFactor}
              y={15 + stoopY}
              width={60 * ageWidthFactor}
              height={70}
              clipPath={`url(#${faceClipId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <>
              {/* Default face features */}
              {/* Eyes */}
              <Circle cx={85} cy={42 + stoopY} r={2} fill="#333" />
              <Circle cx={115} cy={42 + stoopY} r={2} fill="#333" />
              {/* Eyebrows */}
              <Path
                d={`M80 ${36 + stoopY} Q85 ${33 + stoopY} 90 ${36 + stoopY}`}
                stroke="#333"
                strokeWidth={1}
                fill="none"
              />
              <Path
                d={`M110 ${36 + stoopY} Q115 ${33 + stoopY} 120 ${36 + stoopY}`}
                stroke="#333"
                strokeWidth={1}
                fill="none"
              />
              {/* Nose */}
              <Path
                d={`M98 ${45 + stoopY} Q100 ${50 + stoopY} 102 ${45 + stoopY}`}
                stroke="#333"
                strokeWidth={0.8}
                fill="none"
              />
              {/* Mouth */}
              {gender === 'male' ? (
                <Path
                  d={`M92 ${58 + stoopY} Q100 ${63 + stoopY} 108 ${58 + stoopY}`}
                  stroke="#333"
                  strokeWidth={1}
                  fill="none"
                />
              ) : (
                <Path
                  d={`M90 ${55 + stoopY} Q100 ${63 + stoopY} 110 ${55 + stoopY}`}
                  stroke="#C49"
                  strokeWidth={1.5}
                  fill="none"
                />
              )}
            </>
          )}

          {/* ── NECK ── */}
          <Rect
            x={90 - 4 * (1 - ageWidthFactor)}
            y={85 + stoopY * 0.5}
            width={20 * ageWidthFactor}
            height={15}
            fill={skinHex}
          />

          {/* ── TORSO ── */}
          {gender === 'female' ? (
            <>
              {/* Upper body — narrower waist */}
              <Path
                d={`M${70 * ageWidthFactor} ${100 + stoopY * 0.3} Q${82 * ageWidthFactor} ${
                  120 + stoopY * 0.3
                } ${76 * ageWidthFactor} 150 L${124 * ageWidthFactor} 150 Q${118 * ageWidthFactor} ${
                  120 + stoopY * 0.3
                } ${130 * ageWidthFactor} ${100 + stoopY * 0.3} Z`}
                fill={skinHex}
              />
              {/* Bust */}
              <Ellipse
                cx={82 * ageWidthFactor}
                cy={120 + stoopY * 0.3}
                rx={10 * ageWidthFactor}
                ry={8}
                fill={skinHex}
                opacity={0.85}
              />
              <Ellipse
                cx={118 * ageWidthFactor}
                cy={120 + stoopY * 0.3}
                rx={10 * ageWidthFactor}
                ry={8}
                fill={skinHex}
                opacity={0.85}
              />
              {/* Waist indent */}
              <Path
                d={`M${76 * ageWidthFactor} 150 L${124 * ageWidthFactor} 150`}
                stroke="rgba(0,0,0,0.05)"
                strokeWidth={1}
              />
            </>
          ) : (
            <>
              {/* Male torso — broader shoulders */}
              <Path
                d={`M${68 * ageWidthFactor} ${100 + stoopY * 0.3} Q${78 * ageWidthFactor} ${
                  130 + stoopY * 0.3
                } ${72 * ageWidthFactor} 155 L${128 * ageWidthFactor} 155 Q${122 * ageWidthFactor} ${
                  130 + stoopY * 0.3
                } ${132 * ageWidthFactor} ${100 + stoopY * 0.3} Z`}
                fill={skinHex}
              />
              {/* Chest line */}
              <Path
                d={`M${82 * ageWidthFactor} ${118 + stoopY * 0.3} Q100 ${125 + stoopY * 0.3} ${
                  118 * ageWidthFactor
                } ${118 + stoopY * 0.3}`}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={0.8}
                fill="none"
              />
            </>
          )}

          {/* ── ARMS ── */}
          {/* Left arm */}
          <Path
            d={`M${70 * ageWidthFactor} ${105 + stoopY * 0.3} L${
              48 * ageWidthFactor
            } 180 L${52 * ageWidthFactor} 188 L${72 * ageWidthFactor} ${140 + stoopY * 0.3}`}
            fill={skinHex}
          />
          {/* Right arm */}
          <Path
            d={`M${130 * ageWidthFactor} ${105 + stoopY * 0.3} L${
              152 * ageWidthFactor
            } 180 L${148 * ageWidthFactor} 188 L${128 * ageWidthFactor} ${140 + stoopY * 0.3}`}
            fill={skinHex}
          />

          {/* ── HANDS ── */}
          <Circle cx={50 * ageWidthFactor} cy={188} r={6} fill={skinHex} />
          <Circle cx={150 * ageWidthFactor} cy={188} r={6} fill={skinHex} />

          {/* ── LEGS (proportional to height) ── */}
          <Path
            d={`M${82 * ageWidthFactor} 155 L${78 * ageWidthFactor} ${
              270 * heightFactor
            } L${90 * ageWidthFactor} ${270 * heightFactor} L${
              95 * ageWidthFactor
            } 155`}
            fill={skinHex}
          />
          <Path
            d={`M${118 * ageWidthFactor} 155 L${122 * ageWidthFactor} ${
              270 * heightFactor
            } L${110 * ageWidthFactor} ${270 * heightFactor} L${
              105 * ageWidthFactor
            } 155`}
            fill={skinHex}
          />

          {/* ── FEET ── */}
          <Ellipse
            cx={84 * ageWidthFactor}
            cy={275 * heightFactor}
            rx={14 * ageWidthFactor}
            ry={6}
            fill={skinHex}
          />
          <Ellipse
            cx={116 * ageWidthFactor}
            cy={275 * heightFactor}
            rx={14 * ageWidthFactor}
            ry={6}
            fill={skinHex}
          />
        </G>
      </Svg>
    </View>
  );
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
  },
});
