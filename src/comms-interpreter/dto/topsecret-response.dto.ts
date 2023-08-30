export class TopsecretResponseDto {
  message: string;
  position: { x: number; y: number };

  constructor({
    message,
    position,
  }: {
    position: { x: number; y: number };
    message: string;
  }) {
    this.position = position;
    this.message = message;
  }
}
