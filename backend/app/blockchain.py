import hashlib
import json
import time
from sqlalchemy.orm import Session
from app.database import BlockchainBlock

class Blockchain:
    def __init__(self, db: Session):
        self.db = db
        # Initialize chain if empty
        if self.get_latest_block() is None:
            self.create_genesis_block()

    def create_genesis_block(self):
        genesis_data = json.dumps({"info": "Military Secure Communication System Genesis Block"})
        timestamp = str(time.time())
        nonce, block_hash = self.proof_of_work(0, timestamp, genesis_data, "0")
        
        db_block = BlockchainBlock(
            block_index=0,
            timestamp=timestamp,
            data=genesis_data,
            previous_hash="0",
            nonce=nonce,
            block_hash=block_hash
        )
        self.db.add(db_block)
        self.db.commit()

    def get_latest_block(self) -> BlockchainBlock:
        return self.db.query(BlockchainBlock).order_by(BlockchainBlock.block_index.desc()).first()

    def proof_of_work(self, index, timestamp, data, previous_hash, difficulty=4):
        target = '0' * difficulty
        nonce = 0
        while True:
            raw_data = f"{index}{timestamp}{data}{previous_hash}{nonce}"
            block_hash = hashlib.sha256(raw_data.encode('utf-8')).hexdigest()
            if block_hash.startswith(target):
                return nonce, block_hash
            nonce += 1

    def add_block(self, data_dict: dict) -> BlockchainBlock:
        latest = self.get_latest_block()
        new_index = latest.block_index + 1
        timestamp = str(time.time())
        data_str = json.dumps(data_dict)
        previous_hash = latest.block_hash
        
        nonce, block_hash = self.proof_of_work(new_index, timestamp, data_str, previous_hash)
        
        db_block = BlockchainBlock(
            block_index=new_index,
            timestamp=timestamp,
            data=data_str,
            previous_hash=previous_hash,
            nonce=nonce,
            block_hash=block_hash
        )
        self.db.add(db_block)
        self.db.commit()
        self.db.refresh(db_block)
        return db_block

    def get_chain(self):
        return self.db.query(BlockchainBlock).order_by(BlockchainBlock.block_index.asc()).all()

    def verify_integrity(self) -> tuple[bool, int]:
        chain = self.get_chain()
        for i in range(1, len(chain)):
            current = chain[i]
            previous = chain[i-1]
            
            # Verify self hash
            raw_data = f"{current.block_index}{current.timestamp}{current.data}{current.previous_hash}{current.nonce}"
            recalculated_hash = hashlib.sha256(raw_data.encode('utf-8')).hexdigest()
            if current.block_hash != recalculated_hash:
                return False, current.block_index
                
            # Verify link
            if current.previous_hash != previous.block_hash:
                return False, current.block_index
        return True, -1
