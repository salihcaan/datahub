import { Typography, Button, Modal, message, Select, Spin } from 'antd';
import React, { useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { EMPTY_MESSAGES } from '../../../../constants';
import { useEntityData, useMutationUrn, useRefetch } from '../../../../EntityContext';
import { SidebarHeader } from '../SidebarHeader';
import { SetDomainModal } from './SetDomainModal';
import { useUnsetDomainMutation } from '../../../../../../../graphql/mutations.generated';
import { DomainLink } from '../../../../../../shared/tags/DomainLink';
import { ENTITY_PROFILE_DOMAINS_ID } from '../../../../../../onboarding/config/EntityProfileOnboardingConfig';

interface Option {
    value: string;
    label: string;
}

const options: Option[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Option 4' },
    { value: '5', label: 'Option 5' },
    { value: '6', label: 'Option 6' },
    { value: '7', label: 'Option 7' },
    { value: '8', label: 'Option 8' },
    { value: '9', label: 'Option 9' },
    { value: '10', label: 'Option 10' },
    // Add more options as needed
];

const MyPage: React.FC = () => {
    const [data, setData] = useState(options);
    const [loading, setLoading] = useState(false);

    // const handleInfiniteOnLoad = () => {
    //     setLoading(true);
    //     // Add more options to data array
    //     setTimeout(() => {
    //         setData([...data, ...options]);
    //         setLoading(false);
    //     }, 1000);
    // };

    const handleScroll = (event) => {
        event.persist();
        const { target } = event;
        console.log(target.scrollTop);
        console.log(target.scrollTop + target.offsetHeight, target.scrollHeight);
        if (!loading && target.scrollTop + target.offsetHeight + 1 >= target.scrollHeight) {
            console.log('load');
            setLoading(true);
            target.scrollTo(0, target.scrollHeight);
            setTimeout(() => {
                const value = String(Number(data[data.length - 1].value) + 1);
                const newData = {
                    value,
                    label: `Option ${value}`,
                };
                setData([...data, newData]);
                setLoading(false);
                console.log('added more data', data);
            }, 1000);
        }
    };

    return (
        <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select"
            notFoundContent={loading ? <Spin size="small" /> : null}
            onPopupScroll={handleScroll}
            filterOption={false}
        >
            {data.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                    {item.label}
                </Select.Option>
            ))}
        </Select>
    );
};

export const SidebarDomainSection = () => {
    const { entityData } = useEntityData();
    const refetch = useRefetch();
    const urn = useMutationUrn();
    const [unsetDomainMutation] = useUnsetDomainMutation();
    const [showModal, setShowModal] = useState(false);
    const domain = entityData?.domain?.domain;

    const removeDomain = (urnToRemoveFrom) => {
        unsetDomainMutation({ variables: { entityUrn: urnToRemoveFrom } })
            .then(() => {
                message.success({ content: 'Removed Domain.', duration: 2 });
                refetch?.();
            })
            .catch((e: unknown) => {
                message.destroy();
                if (e instanceof Error) {
                    message.error({ content: `Failed to remove domain: \n ${e.message || ''}`, duration: 3 });
                }
            });
    };

    const onRemoveDomain = (urnToRemoveFrom) => {
        Modal.confirm({
            title: `Confirm Domain Removal`,
            content: `Are you sure you want to remove this domain?`,
            onOk() {
                removeDomain(urnToRemoveFrom);
            },
            onCancel() {},
            okText: 'Yes',
            maskClosable: true,
            closable: true,
        });
    };

    return (
        <div>
            <div id={ENTITY_PROFILE_DOMAINS_ID} className="sidebar-domain-section">
                <SidebarHeader title="Domain" />
                <div>
                    {domain && (
                        <DomainLink
                            domain={domain}
                            closable
                            onClose={(e) => {
                                e.preventDefault();
                                onRemoveDomain(entityData?.domain?.associatedUrn);
                            }}
                        />
                    )}
                    {!domain && (
                        <>
                            <Typography.Paragraph type="secondary">
                                {EMPTY_MESSAGES.domain.title}. {EMPTY_MESSAGES.domain.description}
                            </Typography.Paragraph>
                            <Button type="default" onClick={() => setShowModal(true)}>
                                <EditOutlined /> Set Domain
                            </Button>
                        </>
                    )}
                </div>
                {showModal && (
                    <SetDomainModal
                        urns={[urn]}
                        refetch={refetch}
                        onCloseModal={() => {
                            setShowModal(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};
