import React, { useState, useEffect } from "react";
import "./SimpleInputModal.css";
import {
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";

export default function SimpleInputModal({ open, handleClose,doOnConfirm,title,symbol }) {
  const [col, setCol] = useState(0);

  const onConfirm = () => {
    doOnConfirm(col);
    handleClose();
  };

  useEffect(() => {
    setCol(0)
  }, [open])
  

  return (
    <Modal isOpen={open} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent className="modal" w="300px">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton
          _focus={{
            boxShadow: "none",
          }}
        />
        <ModalBody paddingBottom="1.5rem">
          <VStack>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                color="gray.300"
                fontSize="1.2em"
                children={symbol}
              />
              <Input
                placeholder="Enter amount"
                type="number"
                value={col}
                onChange={(e) => {
                  setCol(e.target.value);
                }}
              />
            </InputGroup>
            <Button
              className="selected-tlbr-btn raise confirm"
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
