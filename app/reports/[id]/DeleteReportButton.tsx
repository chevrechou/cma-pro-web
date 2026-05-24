'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    modals.openConfirmModal({
      title: 'Delete Report',
      children: 'This CMA report will be permanently deleted.',
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await supabase.from('cma_reports').delete().eq('id', id);
        setDeleting(false);
        if (error) {
          notifications.show({ color: 'red', title: 'Delete failed', message: error.message });
          return;
        }
        router.push('/dashboard');
        router.refresh();
      },
    });
  }

  return (
    <Button
      color="red" variant="subtle"
      leftSection={<IconTrash size={16} />}
      onClick={handleDelete} loading={deleting}
    >
      Delete
    </Button>
  );
}
