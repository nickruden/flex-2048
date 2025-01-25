export class VirtualCell {
    constructor(x, y, updateScore, getScore, setScore) {
      this.x = x;
      this.y = y;
      this.updateScore = updateScore;
      this.getScore = getScore;
      this.setScore = setScore;
    }
  
    linkTile(tile) {
      tile.setX(this.x);
      tile.setY(this.y);
      this.linkedTile = tile;
    }
  
    unlinkTile() {
      this.linkedTile = null;
    }
  
    hasLinkedTile() {
      return !!this.linkedTile;
    }
  
    linkTileForMerge(tile) {
      tile.setX(this.x);
      tile.setY(this.y);
      this.linkedTileForMerge = tile;
    }
  
    unlinkTileForMerge() {
      this.linkedTileForMerge = null;
    }
  
    hasLinkedTileForMerge() {
      return !!this.linkedTileForMerge;
    }
  
    canAccept(tile) {
      return (
        !this.hasLinkedTile() ||
        (!this.hasLinkedTileForMerge() && this.linkedTile.value === tile.value)
      );
    }
  
    mergeTiles() {
      if (!this.hasLinkedTile() || !this.hasLinkedTileForMerge()) {
        return;
      }
  
      const mergedValue = this.linkedTile.value + this.linkedTileForMerge.value;
    this.linkedTile.setValue(mergedValue);

    // Обновляем счет
    const currentScore = this.getScore();
    const newScore = currentScore + mergedValue;
    this.setScore(newScore);
    this.updateScore();

    this.linkedTileForMerge.removeFromDOM();
    this.unlinkTileForMerge();
    }
  }