import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import * as attachmentService from "@/services/api/attachmentService";

const AttachmentList = ({ taskId, onAttachmentChange }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getByTaskId(taskId);
      setAttachments(data);
    } catch (error) {
      toast.error("Failed to load attachments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      setDeleting(attachmentId);
      const success = await attachmentService.remove(attachmentId);
      
      if (success) {
        setAttachments(prev => prev.filter(att => att.Id !== attachmentId));
        if (onAttachmentChange) onAttachmentChange();
      }
    } catch (error) {
      toast.error("Failed to delete attachment");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      // In a real implementation, this would download the file
      // For now, we'll just show a message
      toast.info(`Downloading ${attachment.file_name_c}...`);
      
      // Simulate download link click
      const link = document.createElement('a');
      link.href = attachment.file_path_c || '#';
      link.download = attachment.file_name_c;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to download attachment");
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "File";
    
    const type = fileType.toLowerCase();
    if (type.includes('image')) return "Image";
    if (type.includes('pdf')) return "FileText";
    if (type.includes('word')) return "FileText";
    if (type.includes('excel') || type.includes('spreadsheet')) return "FileSpreadsheet";
    if (type.includes('video')) return "Video";
    if (type.includes('audio')) return "Music";
    return "File";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin">
          <ApperIcon name="Loader2" size={16} />
        </div>
        <span className="ml-2 text-sm text-gray-600">Loading attachments...</span>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-4">
        <ApperIcon name="Paperclip" size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">No attachments yet</p>
        <p className="text-xs text-gray-400 mt-1">Files will appear here once uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Attachments ({attachments.length})
      </h4>
      
      <AnimatePresence>
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ApperIcon 
                  name={getFileIcon(attachment.file_type_c)} 
                  size={20} 
                  className="text-gray-600" 
                />
              </div>
              
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.file_name_c}
                </p>
                <div className="flex items-center text-xs text-gray-500 space-x-2">
                  <span>{formatFileSize(attachment.file_size_c)}</span>
                  {attachment.upload_date_c && (
                    <>
                      <span>•</span>
                      <span>{format(new Date(attachment.upload_date_c), 'MMM d, yyyy')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Download file"
              >
                <ApperIcon name="Download" size={14} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(attachment.Id, attachment.file_name_c)}
                disabled={deleting === attachment.Id}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete file"
              >
                {deleting === attachment.Id ? (
                  <ApperIcon name="Loader2" size={14} className="animate-spin" />
                ) : (
                  <ApperIcon name="Trash2" size={14} />
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentList;