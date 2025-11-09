import CommonModal from '../modal/CommonModal';
import CommonButton from '../buttons/CommonButton';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
}) => {
  return (
    <CommonModal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={title}
      width="max-w-md"
    >
      <div className="p-4">
        <p className="mb-4 text-gray-700 dark:text-gray-200">{message}</p>
        <div className="flex justify-end gap-3 mt-4">
          <CommonButton type="danger" onClick={() => onClose(false)}>
            Cancel
          </CommonButton>
          <CommonButton type="primary" onClick={onConfirm}>
            Confirm
          </CommonButton>
        </div>
      </div>
    </CommonModal>
  );
};

export default ConfirmDialog;
